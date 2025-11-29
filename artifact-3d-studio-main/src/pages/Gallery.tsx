import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Artifact {
  id: string;
  title: string;
  description: string | null;
  original_image_url: string;
  processing_status: string;
  classification: string | null;
  created_at: string;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("artifacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtifacts(data || []);
    } catch (error: any) {
      console.error("Error fetching artifacts:", error);
      toast.error("Failed to load artifacts");
    } finally {
      setLoading(false);
    }
  };

  const filteredArtifacts = artifacts.filter(
    (artifact) =>
      artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.classification?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      uploading: "bg-muted text-muted-foreground",
      processing: "bg-secondary/20 text-secondary",
      completed: "bg-heritage-teal/20 text-heritage-teal",
      failed: "bg-destructive/20 text-destructive",
    };
    return styles[status as keyof typeof styles] || styles.uploading;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="mb-6 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-heritage-gold to-heritage-teal bg-clip-text text-transparent mb-2">
              Artifact Gallery
            </h1>
            <p className="text-muted-foreground">Browse and search your artifact collection</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artifacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card/95 border-border/50"
              />
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredArtifacts.length === 0 ? (
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No artifacts found matching your search." : "No artifacts yet. Upload your first artifact to get started!"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate("/upload")}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  Upload Artifact
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtifacts.map((artifact) => (
                <Card
                  key={artifact.id}
                  className="border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
                  onClick={() => navigate(`/viewer?id=${artifact.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={artifact.original_image_url}
                      alt={artifact.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/viewer?id=${artifact.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{artifact.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(artifact.processing_status)}`}>
                        {artifact.processing_status}
                      </span>
                    </div>
                    {artifact.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {artifact.description}
                      </p>
                    )}
                    {artifact.classification && (
                      <p className="text-xs text-primary">
                        Classification: {artifact.classification}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(artifact.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Gallery;
