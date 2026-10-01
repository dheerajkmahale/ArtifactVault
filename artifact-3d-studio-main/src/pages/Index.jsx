import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import {
  ArrowRight,
  Scan,
  Eye,
  Sparkles,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Box,
  Compass,
  CheckCircle2,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/30">
        {/* Background ambient lighting glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Photogrammetry & Vision AI
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1]">
            Preserve Antiquity in <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Spatial 3D Reality
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Empowering curators, archaeologists, and institutions to turn 2D photographic scans into
            interactive 3D spatial models powered by Google Gemini 2.5 Flash Vision classification.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/upload")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 shadow-xl shadow-primary/20 text-base w-full sm:w-auto"
            >
              <Scan className="w-5 h-5 mr-2" />
              Digitize an Artifact
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/gallery")}
              className="border-border/60 hover:bg-muted/50 px-8 h-12 text-base w-full sm:w-auto"
            >
              <Eye className="w-5 h-5 mr-2" />
              Browse the Archive
            </Button>
          </div>

          {/* Highlights ribbon */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              WebGL Three.js Orbit Engine
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Gemini Vision Taxonomy
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Cloud Atlas Repository
            </span>
          </div>
        </div>
      </section>

      {/* 3-Step Preservation Pipeline */}
      <section className="py-20 border-b border-border/30 bg-muted/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              Archival Pipeline
            </span>
            <h2 className="text-3xl font-heading font-bold text-foreground">
              From Physical Relic to Digital Heritage
            </h2>
            <p className="text-sm text-muted-foreground">
              A streamlined, high-fidelity pipeline engineered for precision museum preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card border-border/50 bg-card/40 p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold font-mono text-lg border border-primary/20">
                01
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Capture & Upload
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload high-resolution photographs of any ceramic, metalwork, sculpture, or archaeological artifact.
              </p>
            </Card>

            <Card className="glass-card border-border/50 bg-card/40 p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-lg border border-emerald-500/20">
                02
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Gemini Vision Analysis
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gemini 2.5 Flash analyzes surface textures, historical wear, period aesthetics, and cultural provenance.
              </p>
            </Card>

            <Card className="glass-card border-border/50 bg-card/40 p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono text-lg border border-amber-500/20">
                03
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Interactive 3D Study
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Inspect relics in real-time 3D with OrbitControls, wireframe inspection modes, and curatorial reports.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                Archaeological Research Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
                Multi-faceted Metadata & Spatial Fidelity
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every uploaded artifact receives an archaeological dossier containing primary category classification,
                estimated era dating, geographic origins, material composition, physical condition diagnostics, and
                contextual descriptions.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Confidence-Scored Classification</h4>
                    <p className="text-xs text-muted-foreground">Automated percentage scores with detailed taxonomic breakdown.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Three.js Spatial Studio</h4>
                    <p className="text-xs text-muted-foreground">Smooth rotation, zoom, wireframe toggle, and multi-light rendering.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl border border-primary/20 bg-card/60 p-8 shadow-2xl backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="text-xs font-mono text-primary uppercase">Preservation Preview</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
                    Illustrative Example
                  </span>
                </div>
                <h4 className="font-heading font-bold text-lg text-foreground">Attic Black-Figure Amphora</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-muted/40 border border-border/30">
                    <span className="text-[10px] font-mono text-muted-foreground">ERA</span>
                    <p className="font-semibold text-foreground">Archaic Period (~540 BCE)</p>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40 border border-border/30">
                    <span className="text-[10px] font-mono text-muted-foreground">MATERIAL</span>
                    <p className="font-semibold text-foreground">Terracotta / Slip</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Finely articulated mythological combat scene with incision techniques characteristic of the Exekias workshop.
                </p>
                <Button
                  onClick={() => navigate("/gallery")}
                  variant="outline"
                  className="w-full border-border/60 hover:bg-muted text-xs h-9 font-medium"
                >
                  Browse Gallery Archive →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/30 py-8 bg-card/20">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" />
            <span className="font-heading font-semibold text-foreground">ArtifactVault</span>
            <span>— Digital Cultural Preservation Studio</span>
          </div>
          <p className="font-mono">
            Powered by Express, MongoDB, Three.js & Gemini 2.5 Flash
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
