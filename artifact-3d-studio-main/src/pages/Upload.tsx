import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload as UploadIcon, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";

const Upload = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      toast.error("Please drop an image file");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    if (!formData.title) {
      toast.error("Please provide a title");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("artifacts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("artifacts")
        .getPublicUrl(fileName);

      // Create artifact record
      const { data: artifactData, error: insertError } = await supabase
        .from("artifacts")
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          original_image_url: publicUrl,
          processing_status: "processing",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Artifact uploaded! AI classification in progress...");

      // Trigger AI classification in background
      supabase.functions.invoke('classify-artifact', {
        body: {
          artifactId: artifactData.id,
          imageUrl: publicUrl
        }
      }).then(({ data, error }) => {
        if (error) {
          console.error('Classification error:', error);
        } else {
          console.log('Classification started:', data);
        }
      });

      navigate("/gallery");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload artifact");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="mb-6 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="border-border/50 bg-card/95 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-heritage-gold to-heritage-teal bg-clip-text text-transparent">
                Upload Artifact
              </CardTitle>
              <CardDescription>
                Upload a 2D image to begin the 3D scanning and classification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Artifact Image</Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg shadow-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop your image here, or
                          </p>
                          <Input
                            id="file"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Label
                            htmlFor="file"
                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                          >
                            <UploadIcon className="mr-2 h-4 w-4" />
                            Choose File
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Ancient Pottery Vase"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-muted/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the artifact..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/50 min-h-24"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
                  disabled={uploading || !file}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading & Processing...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-5 w-5" />
                      Upload and Process
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Upload;
