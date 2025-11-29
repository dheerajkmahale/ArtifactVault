import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Upload, Eye, LogOut, Grid3x3 } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalArtifacts: 0,
    processing: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: artifacts, error } = await supabase
        .from("artifacts")
        .select("processing_status")
        .eq("user_id", user.id);

      if (error) throw error;

      const total = artifacts?.length || 0;
      const processing = artifacts?.filter((a) => a.processing_status === "processing").length || 0;
      const completed = artifacts?.filter((a) => a.processing_status === "completed").length || 0;

      setStats({ totalArtifacts: total, processing, completed });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-heritage-brown to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-heritage-gold to-heritage-teal bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome to your artifact collection</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-border/50 hover:border-destructive hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Total Artifacts</CardTitle>
                <CardDescription>All scanned items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{stats.totalArtifacts}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Processing</CardTitle>
                <CardDescription>Currently being analyzed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-secondary">{stats.processing}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Completed</CardTitle>
                <CardDescription>Ready to view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-heritage-teal">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your artifacts</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate("/upload")}
                className="h-24 bg-primary hover:bg-primary/90 text-primary-foreground flex flex-col items-center justify-center gap-2"
              >
                <Upload className="h-8 w-8" />
                <span className="font-semibold">Upload New Artifact</span>
              </Button>

              <Button
                onClick={() => navigate("/gallery")}
                variant="outline"
                className="h-24 border-border/50 hover:border-primary hover:bg-primary/10 flex flex-col items-center justify-center gap-2"
              >
                <Grid3x3 className="h-8 w-8" />
                <span className="font-semibold">View Gallery</span>
              </Button>

              <Button
                onClick={() => navigate("/viewer")}
                variant="outline"
                className="h-24 border-border/50 hover:border-secondary hover:bg-secondary/10 flex flex-col items-center justify-center gap-2"
              >
                <Eye className="h-8 w-8" />
                <span className="font-semibold">3D Viewer</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
