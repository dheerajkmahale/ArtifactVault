import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Calendar,
  Globe,
  Layers,
  ShieldAlert,
  Trash2,
  RefreshCw,
  Eye,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  Clock,
  Box,
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

  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const meshRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (artifactId) {
      fetchArtifact();
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
      const data = await api.artifacts.getById(artifactId);
      setArtifact(data);
    } catch (error) {
      console.error("Error fetching artifact:", error);
      toast.error("Failed to load artifact");
    } finally {
      setLoading(false);
    }
  };

  const handleClassify = async () => {
    if (!artifact?.id) return;
    setIsClassifying(true);
    try {
      const res = await api.artifacts.classify(artifact.id);
      if (res.artifact) {
        setArtifact(res.artifact);
        if (res.artifact.classification) {
          toast.success("Classification completed successfully!");
        } else {
          toast.info(res.message || "Classification pending. Ensure GEMINI_API_KEY is configured.");
        }
      }
    } catch (err) {
      console.error("Classify error:", err);
      toast.error(err.message || "Failed to trigger classification");
    } finally {
      setIsClassifying(false);
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
    scene.background = new THREE.Color(0x0c0f17); // Dark luxury museum obsidian

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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClassify}
                disabled={isClassifying}
                className="border-primary/30 hover:bg-primary/10 text-primary"
              >
                {isClassifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Analyzing with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Re-Analyze AI
                  </>
                )}
              </Button>

              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 px-3 py-1 rounded-md">
                  <span className="text-xs text-destructive font-medium">Delete permanently?</span>
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
                  {/* Status Indicator Pill */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {categoryTitle}
                      </span>
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
                          Vaulted & Verified
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 animate-spin" />
                          Processing
                        </>
                      )}
                    </span>
                  </div>

                  <CardTitle className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                    {artifact.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono text-muted-foreground">
                    Cataloged into ArtifactVault preservation registry
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Classification Progress / State */}
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
                  ) : (
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
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                            {eraText}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Globe className="w-3 h-3 text-primary/70" />
                            Geographic Region
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                            {regionText}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-3 h-3 text-primary/70" />
                            Material
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                            {materialText}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/50">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-primary/70" />
                            Condition
                          </span>
                          <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                            {conditionText}
                          </p>
                        </div>
                      </div>

                      {/* Rich Curatorial Description Block */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          Curatorial Analysis & Provenance
                        </h4>
                        <div className="p-4 rounded-xl bg-card/40 border border-border/40 text-sm leading-relaxed text-muted-foreground text-justify relative">
                          <p>{descriptionText}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Viewer;
