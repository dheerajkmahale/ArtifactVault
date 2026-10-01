import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Upload as UploadIcon,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const Upload = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file (PNG, JPG, WEBP)");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      toast.error("Please drop an image file");
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an artifact image");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please provide an artifact title");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("title", formData.title.trim());
      if (formData.description) {
        data.append("description", formData.description.trim());
      }

      const res = await api.artifacts.upload(data);
      toast.success("Artifact uploaded & cataloged successfully!");
      if (res?.id) {
        navigate(`/viewer?id=${res.id}`);
      } else {
        navigate("/gallery");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload artifact");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            size="sm"
            className="mb-6 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="glass-panel border-primary/20 bg-card/60 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Photogrammetry Ingestion
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                Catalog & Digitize Relic
              </CardTitle>
              <CardDescription>
                Upload a 2D photograph to trigger automated Gemini Vision classification and 3D spatial preservation.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Dropzone */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground uppercase">
                    Artifact Photographic Source *
                  </Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-border/70 hover:border-primary/60 rounded-xl p-8 text-center transition-colors bg-muted/20 hover:bg-muted/30 cursor-pointer"
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Artifact preview"
                          className="max-h-72 mx-auto rounded-lg shadow-2xl border border-border/50 object-contain"
                        />
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFile(null);
                              setPreview(null);
                            }}
                            className="border-border/60 hover:bg-muted"
                          >
                            Change Image
                          </Button>
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Image Loaded
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Drag and drop artifact image here, or browse files
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            Supports PNG, JPG, JPEG, WEBP (up to 20MB)
                          </p>
                        </div>
                        <div className="pt-2">
                          <Input
                            id="file-upload-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Label
                            htmlFor="file-upload-input"
                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 py-2 shadow-md shadow-primary/20"
                          >
                            <UploadIcon className="mr-1.5 h-3.5 w-3.5" />
                            Select File
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="artifact-title" className="text-xs font-mono text-muted-foreground uppercase">
                    Artifact Identification / Title *
                  </Label>
                  <Input
                    id="artifact-title"
                    placeholder="e.g. Minoan Kamares Ware Beak-Spouted Jug"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-muted/30 border-border/50 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="artifact-description" className="text-xs font-mono text-muted-foreground uppercase">
                    Curatorial Notes / Excavation Site (Optional)
                  </Label>
                  <Textarea
                    id="artifact-description"
                    placeholder="Document excavation locus, accession numbers, known provenance, or physical measurements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/30 border-border/50 min-h-24 text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 shadow-lg shadow-primary/20"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingesting & Generating 3D Mesh...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Preserve & Analyze Artifact
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Upload;
