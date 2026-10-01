import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Upload,
  Grid3x3,
  LogOut,
  Loader2,
  Box,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.auth.getProfile();
      setProfileData(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      // Fallback to local storage if endpoint fails
      const localUser = api.getUser();
      if (localUser) {
        setProfileData({
          ...localUser,
          totalArtifacts: 0,
          completedArtifacts: 0,
          processingArtifacts: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-mono">Loading curator credentials...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header Hero Card */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card/95 to-primary/5 p-8 shadow-2xl backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary via-amber-500 to-amber-200 p-0.5 shadow-xl shadow-primary/20">
                        <div className="w-full h-full rounded-[14px] bg-background/90 flex items-center justify-center">
                          <span className="text-2xl font-bold font-heading text-primary">
                            {profileData?.name ? profileData.name[0].toUpperCase() : "C"}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-background flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                          {profileData?.name || "Artifact Curator"}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30">
                          Curator
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-primary/70" />
                          {profileData?.email || "curator@artifactvault.io"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary/70" />
                          Member since {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "2026"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-stretch md:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 md:flex-initial"
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card border-border/50 bg-card/60 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-amber-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs uppercase tracking-wider font-mono">Total Vaulted</span>
                      <Box className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-heading text-foreground">
                      {profileData?.totalArtifacts ?? 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Archived physical relics & scans</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/50 bg-card/60 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs uppercase tracking-wider font-mono">AI Classified</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-heading text-emerald-400">
                      {profileData?.completedArtifacts ?? 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Gemini vision verified & tagged</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/50 bg-card/60 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs uppercase tracking-wider font-mono">Processing</span>
                      <Layers className="w-4 h-4 text-amber-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-heading text-amber-400">
                      {profileData?.processingArtifacts ?? 0}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Meshing & classification queue</p>
                  </CardContent>
                </Card>
              </div>

              {/* System Engine Specifications */}
              <Card className="glass-panel border-border/50 bg-card/40">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    Archive Infrastructure & Diagnostics
                  </CardTitle>
                  <CardDescription>
                    Connected services powering your 3D preservation workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-start gap-3">
                      <Database className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Backend & Storage</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Express.js Server on port 5000 with MongoDB Atlas storage & Multer static asset serving.
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ONLINE & SYNCED
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">AI Vision Classifier</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Google Gemini 2.5 Flash pipeline for automated archaeological taxonomy, era & material analysis.
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          GEMINI-2.5-FLASH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Navigation Buttons */}
                  <div className="pt-4 flex flex-wrap gap-3">
                    <Button
                      onClick={() => navigate("/upload")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Scan New Artifact
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/gallery")}
                      className="border-border/60 hover:bg-muted"
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      Explore Gallery
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/dashboard")}
                      className="hover:bg-muted"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Profile;
