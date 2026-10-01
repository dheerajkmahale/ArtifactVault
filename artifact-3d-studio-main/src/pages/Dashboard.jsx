import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  Upload,
  Eye,
  Grid3x3,
  User,
  Sparkles,
  Layers,
  Box,
  Trash2,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => api.getUser());
  const [artifacts, setArtifacts] = useState([]);
  const [stats, setStats] = useState({
    totalArtifacts: 0,
    processing: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [artList, currentUser] = await Promise.all([
        api.artifacts.getAll(),
        api.auth.getMe(),
      ]);

      if (currentUser) {
        setUser(currentUser);
      }

      const items = artList || [];
      setArtifacts(items);

      const total = items.length;
      const processing = items.filter((a) => a.processing_status === "processing").length;
      const completed = items.filter((a) => a.processing_status === "completed").length;
      setStats({ totalArtifacts: total, processing, completed });
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently remove this artifact from your vault?")) return;

    try {
      setDeletingId(id);
      await api.artifacts.delete(id);
      setArtifacts((prev) => prev.filter((a) => a.id !== id));
      setStats((prev) => ({
        ...prev,
        totalArtifacts: Math.max(0, prev.totalArtifacts - 1),
      }));
      toast.success("Artifact deleted from vault");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete artifact");
    } finally {
      setDeletingId(null);
    }
  };

  const getCategory = (art) => {
    if (!art.classification) return "General Relic";
    if (typeof art.classification === "string") return art.classification;
    return art.classification.category || "General Relic";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card/90 to-primary/10 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 inline-block mb-3">
                  Curatorial Command Center
                </span>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  Welcome back, {user?.name || "Curator"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Manage your photogrammetric 3D scans, Gemini vision curatorial records, and historical digital preservations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/upload")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Scan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/gallery")}
                  className="border-border/60 hover:bg-muted"
                >
                  <Grid3x3 className="w-4 h-4 mr-1.5" />
                  View Gallery
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="glass-card border-border/50 bg-card/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-amber-500" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider font-mono">Total Artifacts</span>
                  <Box className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold font-heading text-foreground">
                  {stats.totalArtifacts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Archived physical relics</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 bg-card/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider font-mono">Gemini Analyzed</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <CardTitle className="text-3xl font-bold font-heading text-emerald-400">
                  {stats.completed}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Classified & ready for 3D view</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 bg-card/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider font-mono">Processing Queue</span>
                  <Layers className="w-4 h-4 text-amber-400" />
                </div>
                <CardTitle className="text-3xl font-bold font-heading text-amber-400">
                  {stats.processing}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Awaiting classification / meshing</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Navigation Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              onClick={() => navigate("/upload")}
              className="glass-panel border-border/50 bg-card/40 hover:border-primary/50 transition-all cursor-pointer p-6 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    Upload & Scan
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Import photographs to generate 3D models and classification.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => navigate("/gallery")}
              className="glass-panel border-border/50 bg-card/40 hover:border-primary/50 transition-all cursor-pointer p-6 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                  <Grid3x3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    Artifact Catalog
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Browse categories, search, and view models.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => navigate("/profile")}
              className="glass-panel border-border/50 bg-card/40 hover:border-primary/50 transition-all cursor-pointer p-6 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    Curator Profile
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Account credentials, database links, and system status.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Artifacts Table / Showcase */}
          <Card className="glass-panel border-border/50 bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-heading">Recent Vault Submissions</CardTitle>
                <CardDescription>Most recently cataloged cultural relics</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/gallery")}
                className="text-xs text-primary hover:text-primary"
              >
                View All →
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : artifacts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-muted-foreground mb-4">No artifacts vaulted yet.</p>
                  <Button
                    onClick={() => navigate("/upload")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Upload First Artifact
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {artifacts.slice(0, 5).map((art) => {
                    const isDeleting = deletingId === art.id;
                    const cat = getCategory(art);

                    return (
                      <div
                        key={art.id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-muted/20 px-3 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => navigate(`/viewer?id=${art.id}`)}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 bg-black/40 shrink-0">
                            <img
                              src={art.original_image_url}
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {art.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                              <span className="text-primary/90">{cat}</span>
                              <span>•</span>
                              <span>
                                {art.created_at
                                  ? new Date(art.created_at).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full ${
                              art.processing_status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {art.processing_status === "completed" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                3D Ready
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 animate-spin" />
                                Processing
                              </>
                            )}
                          </span>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/viewer?id=${art.id}`);
                            }}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Eye className="w-3.5 h-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">Launch 3D</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isDeleting}
                            onClick={(e) => handleDelete(e, art.id)}
                            className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
