import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Artifact {
  id: string;
  title: string;
  original_image_url: string;
  classification: string | null;
  processing_status: string;
}

const ClassifyTest = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState<string | null>(null);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("artifacts")
        .select("id, title, original_image_url, classification, processing_status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtifacts(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to load artifacts");
    } finally {
      setLoading(false);
    }
  };

  const handleClassify = async (artifactId: string, imageUrl: string) => {
    setClassifying(artifactId);
    try {
      const { data, error } = await supabase.functions.invoke('classify-artifact', {
        body: { artifactId, imageUrl }
      });

      if (error) throw error;
      
      toast.success("Classification complete!");
      await fetchArtifacts();
    } catch (error: any) {
      console.error("Classification error:", error);
      toast.error(error.message || "Classification failed");
    } finally {
      setClassifying(null);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-heritage-gold to-heritage-teal bg-clip-text text-transparent">
                AI Classification Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Test the AI classification on your uploaded artifacts. Click "Classify" to analyze any artifact.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {artifacts.map((artifact) => (
              <Card key={artifact.id} className="border-border/50 bg-card/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <img
                      src={artifact.original_image_url}
                      alt={artifact.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{artifact.title}</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-muted-foreground">Status:</span>{" "}
                          <span className="capitalize">{artifact.processing_status}</span>
                        </p>
                        {artifact.classification && (
                          <p>
                            <span className="text-muted-foreground">Classification:</span>{" "}
                            <span className="text-primary font-semibold">{artifact.classification}</span>
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleClassify(artifact.id, artifact.original_image_url)}
                        disabled={classifying === artifact.id}
                        className="mt-4 bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        {classifying === artifact.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {artifact.classification ? "Re-classify" : "Classify"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {artifacts.length === 0 && (
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm p-12 text-center">
              <p className="text-muted-foreground">No artifacts yet. Upload some artifacts first!</p>
            </Card>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default ClassifyTest;
