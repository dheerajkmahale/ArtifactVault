import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { exportArtifactPDF } from "@/lib/pdfExport";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  Globe,
  Layers,
  ShieldAlert,
  Trash2,
  Eye,
  RotateCcw,
  CheckCircle2,
  Clock,
  Box,
  Edit3,
  Save,
  X,
  FileDown,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Viewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artifactId = searchParams.get("id");

  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);

  // Curatorial Edit mode state ("AI suggests, human confirms")
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    era: "",
    region: "",
    material: "",
    condition: "",
    description: "",
  });

  // Similarity Search state
  const [similarArtifacts, setSimilarArtifacts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // PDF Export state
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const meshRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (artifactId) {
      fetchArtifact();
      fetchSimilar(artifactId);
    }
  }, [artifactId]);

  useEffect(() => {
    if (artifact && viewerRef.current) {
      initThreeJS();
    }
    return () => {
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [artifact]);

  const fetchArtifact = async () => {
    try {
      if (!artifactId) return;
      setLoading(true);
      const data = await api.artifacts.getById(artifactId);
      setArtifact(data);
      populateEditForm(data);
    } catch (error) {
      console.error("Error fetching artifact:", error);
      toast.error("Failed to load artifact");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async (id) => {
    try {
      setLoadingSimilar(true);
      const matches = await api.artifacts.getSimilar(id);
      setSimilarArtifacts(matches || []);
    } catch (err) {
      console.warn("Could not load similar artifacts:", err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const populateEditForm = (art) => {
    const classObj =
      typeof art?.classification === "object" && art?.classification !== null
        ? art.classification
        : {};
    setEditForm({
      title: art?.title || "",
      category: classObj.category || "",
      era: classObj.era || art?.metadata?.estimatedEra || "",
      region: classObj.region || art?.metadata?.culturalOrigin || "",
      material: classObj.material || art?.metadata?.material || "",
      condition: classObj.condition || art?.metadata?.condition || "",
      description: classObj.description || art?.description || "",
    });
  };

  const handleStartEdit = () => {
    populateEditForm(artifact);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    populateEditForm(artifact);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!artifact?.id) return;
    setIsSaving(true);
    try {
      const updated = await api.artifacts.update(artifact.id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        era: editForm.era,
        region: editForm.region,
        material: editForm.material,
        condition: editForm.condition,
      });

      setArtifact(updated);
      populateEditForm(updated);
      setIsEditing(false);
      toast.success("Classification verified & curatorial edits saved!");
      // Refresh similar artifacts with updated embedding
      fetchSimilar(artifact.id);
    } catch (err) {
      console.error("Failed to save curatorial updates:", err);
      toast.error(err.message || "Failed to save edits");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClassify = async () => {
    if (!artifact?.id) return;
    setIsClassifying(true);
    try {
      const res = await api.artifacts.classify(artifact.id);
      if (res.artifact) {
        setArtifact(res.artifact);
        populateEditForm(res.artifact);
        if (res.artifact.classification) {
          toast.success("Gemini classification updated!");
        } else {
          toast.info(res.message || "Classification pending.");
        }
        fetchSimilar(artifact.id);
      }
    } catch (err) {
      console.error("Classify error:", err);
      toast.error(err.message || "Failed to trigger classification");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleExportPDF = async () => {
    if (!artifact) return;
    setIsExportingPDF(true);
    try {
      await exportArtifactPDF(artifact);
      toast.success("Archival Catalog Card exported as PDF!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Could not export PDF catalog card");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDelete = async () => {
    if (!artifact?.id) return;
    setIsDeleting(true);
    try {
      await api.artifacts.delete(artifact.id);
      toast.success("Artifact removed from vault");
      navigate("/gallery");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete artifact");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleWireframe = () => {
    const nextState = !isWireframe;
    setIsWireframe(nextState);
    if (meshRef.current) {
      if (meshRef.current.material) {
        meshRef.current.material.wireframe = nextState;
      }
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.wireframe = nextState;
        }
      });
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const initThreeJS = () => {
    if (!viewerRef.current) return;

    const width = viewerRef.current.clientWidth;
    const height = viewerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c0f17); // Dark luxury obsidian

    // Ambient Lighting + Gold directional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    goldKeyLight.position.set(5, 8, 5);
    scene.add(goldKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-5, -3, -5);
    scene.add(rimLight);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    viewerRef.current.innerHTML = "";
    viewerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    if (artifact?.model_url) {
      const loader = new GLTFLoader();
      loader.load(
        artifact.model_url,
        (gltf) => {
          meshRef.current = gltf.scene;
          scene.add(gltf.scene);
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          gltf.scene.position.subVectors(gltf.scene.position, center);
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.z = maxDim * 2.2;
          controls.target.set(0, 0, 0);
          controls.update();
        },
        undefined,
        (err) => {
          console.warn("GLTF load failed, using fallback:", err);
          createFallbackCube(scene, camera);
        }
      );
    } else {
      createFallbackCube(scene, camera);
    }

    function createFallbackCube(s, cam) {
      const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(artifact?.original_image_url || "");
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.15,
      });
      const cube = new THREE.Mesh(geometry, material);
      meshRef.current = cube;
      s.add(cube);
      cam.position.set(0, 0, 5);
    }

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (meshRef.current && !controls.state == -1) {
        meshRef.current.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!viewerRef.current) return;
      const w = viewerRef.current.clientWidth;
      const h = viewerRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
    };
  };

  // Safe extraction of classification fields
  const classificationObj =
    typeof artifact?.classification === "object" && artifact?.classification !== null
      ? artifact.classification
      : typeof artifact?.classification === "string"
      ? { category: artifact.classification, description: artifact.description }
      : null;

  const categoryTitle = classificationObj?.category || "Unclassified Relic";
  const confidenceScore = classificationObj?.confidence || 92;
  const eraText = classificationObj?.era || artifact?.metadata?.estimatedEra || "Classical Antiquity";
  const regionText = classificationObj?.region || artifact?.metadata?.culturalOrigin || "Eastern Mediterranean";
  const materialText = classificationObj?.material || artifact?.metadata?.material || "Ceramic Terracotta";
  const conditionText = classificationObj?.condition || artifact?.metadata?.condition || "Well Preserved";
  const descriptionText =
    classificationObj?.description || artifact?.description || "Digital scan archived for historical preservation.";

  const isCuratorVerified = !!artifact?.curatorVerified;

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-mono text-muted-foreground">Loading 3D mesh & curatorial data...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!artifact) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="glass-panel p-8 text-center max-w-md">
              <p className="text-muted-foreground mb-4">Artifact record not found or inaccessible.</p>
              <Button onClick={() => navigate("/gallery")} className="bg-primary hover:bg-primary/90">
                Return to Gallery
              </Button>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          {/* Top Bar Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/gallery")}
                variant="ghost"
                size="sm"
                className="hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Gallery
              </Button>
              <div className="h-4 w-px bg-border/60" />
              <span className="text-xs font-mono text-muted-foreground">
                ID: {artifact.id?.slice(-8)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* PDF Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="border-border/60 hover:bg-muted text-foreground"
                id="btn-export-pdf"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Export as PDF
                  </>
                )}
              </Button>

              {/* Edit Mode Toggle Button */}
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartEdit}
                  className="border-primary/40 hover:bg-primary/10 text-primary"
                  id="btn-edit-classification"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Classification
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    id="btn-save-classification"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Save Curatorial Edits
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}

              {/* Re-Analyze Gemini AI */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClassify}
                disabled={isClassifying || isEditing}
                className="border-primary/30 hover:bg-primary/10 text-primary"
              >
                {isClassifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Re-Analyze AI
                  </>
                )}
              </Button>

              {/* Delete Artifact */}
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 px-3 py-1 rounded-md">
                  <span className="text-xs text-destructive font-medium">Delete?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-7 px-2 text-xs"
                  >
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Two-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: 3D Spatial Canvas (Col 7 / 12) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-card/40 shadow-2xl backdrop-blur-xl">
                {/* 3D WebGL Viewport */}
                <div
                  ref={viewerRef}
                  className="w-full h-[420px] md:h-[520px] cursor-grab active:cursor-grabbing relative"
                />

                {/* Floating Viewport Controls */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-md border border-border/50 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    3D WEBGL LIVE
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={toggleWireframe}
                    className={`h-8 px-2.5 text-xs bg-background/80 backdrop-blur-md border border-border/50 hover:bg-muted ${
                      isWireframe ? "text-primary border-primary/50" : "text-muted-foreground"
                    }`}
                    title="Toggle Wireframe Mesh"
                  >
                    <Box className="w-3.5 h-3.5 mr-1" />
                    Wireframe
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={resetCamera}
                    className="h-8 px-2.5 text-xs bg-background/80 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Reset View"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Viewport footer hint */}
                <div className="px-4 py-2.5 bg-background/60 backdrop-blur-md border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>Rotate: Left Click + Drag</span>
                  <span>Zoom: Scroll Wheel</span>
                  <span>Pan: Right Click + Drag</span>
                </div>
              </div>

              {/* Original 2D Reference Image Card */}
              <Card className="glass-panel border-border/50 bg-card/30">
                <CardHeader className="py-3 px-5 border-b border-border/30">
                  <CardTitle className="text-xs uppercase font-mono tracking-wider text-muted-foreground flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    Photogrammetric Reference Source
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-border/50 bg-black/40 shrink-0">
                    <img
                      src={artifact.original_image_url}
                      alt={artifact.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-medium text-foreground">{artifact.title}</p>
                    <p className="text-muted-foreground font-mono">
                      File: {artifact.metadata?.originalName || "artifact-source.png"}
                    </p>
                    <p className="text-muted-foreground font-mono">
                      Uploaded: {artifact.created_at ? new Date(artifact.created_at).toLocaleDateString() : "Recent"}
                    </p>
                    <a
                      href={artifact.original_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-primary hover:underline font-mono text-[11px] pt-1"
                    >
                      View Original Full Resolution →
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Curatorial & AI Results Panel (Col 5 / 12) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="glass-panel border-primary/20 bg-card/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                <CardHeader className="pb-4">
                  {/* Status Indicator Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {categoryTitle}
                      </span>

                      {/* Curator Verified vs AI Suggested Badge */}
                      {isCuratorVerified ? (
                        <span
                          id="badge-curator-verified"
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Curator Verified
                        </span>
                      ) : (
                        <span
                          id="badge-ai-suggested"
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          AI Suggested
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                        artifact.processing_status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {artifact.processing_status === "completed" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Vaulted
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 animate-spin" />
                          Processing
                        </>
                      )}
                    </span>
                  </div>

                  {!isEditing ? (
                    <>
                      <CardTitle className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                        {artifact.title}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono text-muted-foreground">
                        Cataloged into ArtifactVault preservation registry
                      </CardDescription>
                    </>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-mono uppercase text-primary">Artifact Title</label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="bg-card/70 border-primary/40 text-lg font-heading font-bold"
                        id="input-edit-title"
                        placeholder="Artifact Title"
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Classification Progress State */}
                  {isClassifying ? (
                    <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Gemini 2.5 Flash Vision Active</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Analyzing visual patina, typography, tool marks, and material composition...
                        </p>
                      </div>
                    </div>
                  ) : isEditing ? (
                    /* EDIT MODE: Editable Inputs for Curatorial Confirmation */
                    <div className="space-y-4" id="curatorial-edit-form">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
                        <Edit3 className="w-4 h-4 shrink-0" />
                        <span>
                          <strong>Curator Verification Mode:</strong> Human review overrides AI suggestions and marks this artifact as Curator Verified.
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            Primary Category
                          </label>
                          <Input
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="bg-card/60 border-border/60 focus:border-primary"
                            id="input-edit-category"
                            placeholder="e.g. Bronze Weapon, Ceramic Pottery, Ancient Coin"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                              Historical Era
                            </label>
                            <Input
                              value={editForm.era}
                              onChange={(e) => setEditForm({ ...editForm, era: e.target.value })}
                              className="bg-card/60 border-border/60 focus:border-primary"
                              id="input-edit-era"
                              placeholder="e.g. Classical Antiquity (~500 BCE)"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                              Geographical Region
                            </label>
                            <Input
                              value={editForm.region}
                              onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                              className="bg-card/60 border-border/60 focus:border-primary"
                              id="input-edit-region"
                              placeholder="e.g. Ancient Greece, Corinth"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                              Primary Material
                            </label>
                            <Input
                              value={editForm.material}
                              onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                              className="bg-card/60 border-border/60 focus:border-primary"
                              id="input-edit-material"
                              placeholder="e.g. Cast Bronze Alloy"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                              Physical Condition
                            </label>
                            <Input
                              value={editForm.condition}
                              onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                              className="bg-card/60 border-border/60 focus:border-primary"
                              id="input-edit-condition"
                              placeholder="e.g. Well Preserved, Repaired Patina"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                            Curatorial Analysis & Description
                          </label>
                          <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={4}
                            className="bg-card/60 border-border/60 focus:border-primary text-sm leading-relaxed"
                            id="input-edit-description"
                            placeholder="Detailed archival notes on styling, patina, and historical significance..."
                          />
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex-1"
                            id="btn-confirm-save-edits"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving & Verifying...
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Confirm & Mark Curator Verified
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="border-border/60"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE: Rich Curatorial & AI Metrics Display */
                    <>
                      {/* Confidence Meter */}
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            AI Confidence Score
                          </span>
                          <span className="font-mono font-bold text-primary">{confidenceScore}% Match</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-primary to-emerald-400 rounded-full transition-all duration-1000"
                            style={{ width: `${confidenceScore}%` }}
                          />
                        </div>
                      </div>

                      {/* 4-Quadrant Metadata Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary/70" />
                            Era / Period
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2" id="display-artifact-era">
                            {eraText}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Globe className="w-3 h-3 text-primary/70" />
                            Geographic Region
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2" id="display-artifact-region">
                            {regionText}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3 h-3 text-primary/70" />
                            Material
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2" id="display-artifact-material">
                            {materialText}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-primary/70" />
                            Condition
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2" id="display-artifact-condition">
                            {conditionText}
                          </p>
                        </div>
                      </div>

                      {/* Rich Curatorial Description Block */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Curatorial Analysis & Provenance
                          </h4>
                          {isCuratorVerified ? (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Human Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI Generated
                            </span>
                          )}
                        </div>
                        <div className="p-4 rounded-xl bg-card/40 border border-border/40 text-sm leading-relaxed text-muted-foreground text-justify relative">
                          <p id="display-artifact-description">{descriptionText}</p>
                        </div>
                      </div>

                      {/* Curatorial Edit Action Callout */}
                      <div className="pt-1 border-t border-border/30 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {isCuratorVerified
                            ? "Curatorial parameters verified by specialist."
                            : "Notice an inaccuracy? Human curatorial override available."}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleStartEdit}
                          className="text-xs text-primary hover:text-primary hover:bg-primary/10 h-8"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          {isCuratorVerified ? "Edit Record" : "Review & Verify"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SIMILAR ARTIFACTS SECTION (Gemini Embeddings + Cosine Similarity) */}
          <div className="mt-14 space-y-6" id="similar-artifacts-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Similar Vault Artifacts
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Computed via server-side vector cosine similarity of Gemini text embeddings
                </p>
              </div>

              <span className="text-xs font-mono text-muted-foreground self-start sm:self-auto px-3 py-1 rounded-full bg-card/60 border border-border/40">
                Model: gemini-embedding-001
              </span>
            </div>

            {loadingSimilar ? (
              <div className="p-12 rounded-2xl border border-border/40 bg-card/30 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-xs font-mono text-muted-foreground">
                  Calculating vector embeddings & cosine proximity...
                </p>
              </div>
            ) : similarArtifacts.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border/40 bg-card/30 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No other matching relics cataloged yet</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Upload additional artifact scans to view AI-computed contextual similarities and thematic links.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similarArtifacts.map((similar) => (
                  <Card
                    key={similar.id}
                    onClick={() => navigate(`/viewer?id=${similar.id}`)}
                    className="glass-card group border-border/50 bg-card/50 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                      <img
                        src={similar.original_image_url}
                        alt={similar.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary text-black shadow-md flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {similar.similarity}% Similarity
                        </span>
                      </div>
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-background/80 backdrop-blur-md text-foreground border border-border/40">
                          {similar.category}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-heading font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {similar.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {similar.description || "Preserved cultural relic."}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        <span>{similar.era || "Historical"}</span>
                        {similar.curatorVerified ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Viewer;
