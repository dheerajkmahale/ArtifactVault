import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";

interface ArtifactData {
  id: string;
  title: string;
  description: string | null;
  original_image_url: string;
  model_url: string | null;
  processing_status: string;
  classification: string | null;
  metadata: any;
}

const Viewer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artifactId = searchParams.get("id");
  const [artifact, setArtifact] = useState<ArtifactData | null>(null);
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

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
      // Cleanup Three.js
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [artifact]);

  const fetchArtifact = async () => {
    try {
      const { data, error } = await supabase
        .from("artifacts")
        .select("*")
        .eq("id", artifactId)
        .single();

      if (error) throw error;
      setArtifact(data);
    } catch (error: any) {
      console.error("Error fetching artifact:", error);
      toast.error("Failed to load artifact");
    } finally {
      setLoading(false);
    }
  };

  const initThreeJS = () => {
    if (!viewerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1410);

    const camera = new THREE.PerspectiveCamera(
      75,
      viewerRef.current.clientWidth / viewerRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    viewerRef.current.innerHTML = "";
    viewerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd700, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create a placeholder 3D object (cube with texture from the artifact image)
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(artifact?.original_image_url || "");
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = () => {
      isDragging = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y,
        };
        cube.rotation.y += deltaMove.x * 0.01;
        cube.rotation.x += deltaMove.y * 0.01;
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(10, camera.position.z));
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDragging) {
        cube.rotation.x += 0.001;
        cube.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!viewerRef.current) return;
      camera.aspect = viewerRef.current.clientWidth / viewerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
    };
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AuthGuard>
    );
  }

  if (!artifact) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Artifact not found</p>
            <Button onClick={() => navigate("/gallery")}>Return to Gallery</Button>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate("/gallery")}
            variant="ghost"
            className="mb-6 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Viewer */}
            <Card className="lg:col-span-2 border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-heritage-gold to-heritage-teal bg-clip-text text-transparent">
                  {artifact.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={viewerRef}
                  className="w-full h-96 lg:h-[500px] rounded-lg overflow-hidden border border-border/50"
                  style={{ cursor: "grab" }}
                />
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Click and drag to rotate • Scroll to zoom
                </p>
              </CardContent>
            </Card>

            {/* Metadata Panel */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Status</p>
                    <p className="text-foreground capitalize">{artifact.processing_status}</p>
                  </div>
                  
                  {artifact.classification && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Classification</p>
                      <p className="text-primary font-semibold text-lg">{artifact.classification}</p>
                    </div>
                  )}

                  {artifact.metadata && Object.keys(artifact.metadata).length > 0 && (
                    <>
                      {artifact.metadata.subCategory && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Type</p>
                          <p className="text-foreground">{artifact.metadata.subCategory}</p>
                        </div>
                      )}
                      
                      {artifact.metadata.estimatedEra && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Era</p>
                          <p className="text-foreground">{artifact.metadata.estimatedEra}</p>
                        </div>
                      )}

                      {artifact.metadata.material && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Material</p>
                          <p className="text-foreground">{artifact.metadata.material}</p>
                        </div>
                      )}

                      {artifact.metadata.culturalOrigin && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Cultural Origin</p>
                          <p className="text-foreground">{artifact.metadata.culturalOrigin}</p>
                        </div>
                      )}

                      {artifact.metadata.condition && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Condition</p>
                          <p className="text-foreground capitalize">{artifact.metadata.condition}</p>
                        </div>
                      )}

                      {artifact.metadata.notableFeatures && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Notable Features</p>
                          <p className="text-foreground text-sm">{artifact.metadata.notableFeatures}</p>
                        </div>
                      )}

                      {artifact.metadata.confidence && (
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">AI Confidence</p>
                          <p className="text-foreground capitalize">{artifact.metadata.confidence}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {artifact.description && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground text-sm">{artifact.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Original Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={artifact.original_image_url}
                    alt={artifact.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Viewer;
