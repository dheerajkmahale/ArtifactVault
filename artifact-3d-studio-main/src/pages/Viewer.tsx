import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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
    scene.background = new THREE.Color(0xffffff);

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

    camera.position.set(0, 0, 5); // Set initial camera position

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // An animation loop is required when damping is enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2;

    // GLTF Loader
    if (artifact?.model_url) {
      const loader = new GLTFLoader();
      loader.load(
        artifact.model_url,
        (gltf) => {
          scene.add(gltf.scene);

          // Calculate bounding box to center and scale the model
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          // Adjust position to center the model
          gltf.scene.position.subVectors(gltf.scene.position, center);

          // Calculate a scaling factor to fit the model within a certain view
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ *= 1.5; // Add some padding
          camera.position.z = cameraZ;
          controls.target.set(0, 0, 0); // Point controls to the center of the scene
          controls.update();

          setLoading(false); // Model loaded, stop loading indicator
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.error("Error loading GLTF model:", error);
          toast.error("Failed to load 3D model.");
          setLoading(false); // Stop loading even on error
        }
      );
    } else {
      // Fallback if no model URL
      console.warn("No 3D model URL provided. Displaying placeholder.");
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(artifact?.original_image_url || "");
      const material = new THREE.MeshStandardMaterial({ map: texture });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      camera.position.z = 5;
      setLoading(false); // No model to load, stop loading indicator
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // only required if controls.enableDamping is set to true
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
      controls.dispose();
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
      <div className="min-h-screen bg-background">
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
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
