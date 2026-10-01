import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import {
  Box,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  Eye,
  FileDown,
  Search,
  Code,
  Database,
  ArrowRight,
  User,
  CheckCircle2,
  Terminal,
  ExternalLink,
  BookOpen,
  Github,
} from "lucide-react";

const TECH_STACK = [
  {
    category: "Frontend Application",
    tech: "React 18 & Vite",
    desc: "Single-page application with Tailwind CSS design tokens, Radix UI primitives, Lucide icons, and Sonner notifications.",
  },
  {
    category: "3D Spatial Graphics",
    tech: "Three.js & WebGL",
    desc: "Interactive 3D viewport featuring OrbitControls, multi-directional museum lighting, and wireframe mesh inspection.",
  },
  {
    category: "Backend REST API",
    tech: "Node.js & Express",
    desc: "Modular RESTful backend with Multer for secure multipart file streaming, JWT auth middleware, and bcrypt password hashing.",
  },
  {
    category: "Database & Vector Store",
    tech: "MongoDB & Mongoose",
    desc: "Document database storing user accounts, relational artifact metadata, curatorial tags, and 3072-dimensional embedding arrays.",
  },
  {
    category: "Multimodal Vision AI",
    tech: "Google Gemini 2.5 Flash",
    desc: "Vision model analyzing artifact photographs to extract category, confidence, estimated era, geographic origin, material, and physical condition.",
  },
  {
    category: "Semantic Vector Embeddings",
    tech: "gemini-embedding-001",
    desc: "Generates high-dimensional vector embeddings of curatorial descriptions for in-memory cosine similarity search.",
  },
];

const WORKING_FEATURES = [
  {
    icon: Sparkles,
    title: "Gemini Vision Taxonomy",
    desc: "Automatically extracts structured archaeological metadata (category, confidence score, historical era, geographic origin, material composition, and condition state) from 2D photos.",
  },
  {
    icon: ShieldCheck,
    title: "Curator Verification Workflow",
    desc: "'AI suggests, human confirms' paradigm: logged-in curators can review, amend, and formally verify classification fields with permanent 'Curator Verified' badges.",
  },
  {
    icon: Search,
    title: "Embedding-Based Similarity",
    desc: "Generates text embeddings using gemini-embedding-001 and computes server-side vector cosine similarity to surface the closest matching vault relics in real time.",
  },
  {
    icon: Box,
    title: "Interactive 3D Spatial Canvas",
    desc: "Three.js WebGL viewport allowing users to rotate, orbit, zoom, pan, and toggle wireframe geometries with custom museum-grade studio illumination.",
  },
  {
    icon: FileDown,
    title: "One-Page Archival PDF Cards",
    desc: "Generates downloadable, printable museum catalog cards using jsPDF, complete with embedded photographic reference, specifications table, and curatorial verification stamp.",
  },
  {
    icon: Layers,
    title: "Dynamic Gallery & Sorting",
    desc: "Explore vaulted cultural assets with live keyword search, archaeological category filter pills, and multi-mode sorting (Newest, Oldest, Highest Confidence, Alphabetical).",
  },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl space-y-16">
        {/* Header Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Independent Engineering Project
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-foreground">
            About{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              ArtifactVault
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            ArtifactVault is an independent project exploring how modern multimodal vision AI,
            vector embeddings, and interactive 3D WebGL graphics can assist in the digitization,
            curation, and thematic exploration of archaeological and cultural heritage.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => navigate("/gallery")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
            >
              <Eye className="w-4 h-4 mr-2" />
              Explore the Archive
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/upload")}
              className="border-border/60 hover:bg-muted"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Scan & Classify a Relic
            </Button>
          </div>
        </section>

        {/* Project Genesis & Honest Motivation */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          <Card className="md:col-span-7 glass-panel border-border/50 bg-card/40 p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                Project Genesis & Goals
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                Bridging Physical Antiquities and Digital Preservation
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Preserving museum artifacts and historical relics is traditionally a labor-intensive
                process requiring specialized domain experts, manual cataloging, and proprietary archiving
                software.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ArtifactVault was created as a modern web engineering prototype to demonstrate how
                a self-contained MERN stack can integrate lightweight multimodal models (Google Gemini 2.5 Flash),
                generate 3072-dimensional vector text embeddings for similarity search, and leverage client-side
                Three.js WebGL rendering to produce an accessible, curator-friendly cataloging pipeline.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 text-xs font-mono text-muted-foreground mt-4">
              Architected as an end-to-end full-stack portfolio implementation combining vision AI and spatial WebGL.
            </div>
          </Card>

          <Card className="md:col-span-5 glass-panel border-border/50 bg-card/40 p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                The Curatorial Philosophy
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground">
                "AI Suggests, Human Confirms"
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rather than treating AI output as infallible ground truth, ArtifactVault adopts a
                human-in-the-loop paradigm:
              </p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Initial AI Taxonomy:</strong> Gemini Vision generates preliminary estimates of era, region, materials, and condition.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Curatorial Verification:</strong> Authorized human reviewers can edit every attribute, updating vector embeddings and conferring a verified badge.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Transparent Provenance:</strong> Unedited records remain transparently marked as AI Suggested.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 text-xs font-mono text-muted-foreground mt-4">
              Curator human verification overrides AI suggestions directly via protected PATCH APIs.
            </div>
          </Card>
        </section>

        {/* Real Working Features Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              Live Capabilities
            </span>
            <h2 className="text-3xl font-heading font-bold text-foreground">
              What Is Built & Fully Working
            </h2>
            <p className="text-sm text-muted-foreground">
              Every feature listed below is implemented end-to-end and testable right now in the app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKING_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="glass-card border-border/50 bg-card/40 p-6 flex flex-col justify-between hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Actual Technology Stack */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              System Architecture
            </span>
            <h2 className="text-3xl font-heading font-bold text-foreground">
              Under the Hood: Tech Stack
            </h2>
            <p className="text-sm text-muted-foreground">
              Scaffolded originally as a prototype, migrated to a self-contained MERN architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TECH_STACK.map((item) => (
              <div
                key={item.tech}
                className="p-5 rounded-xl border border-border/40 bg-card/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-primary font-semibold tracking-wider">
                    {item.category}
                  </span>
                  <Code className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <h4 className="font-heading font-semibold text-base text-foreground">
                  {item.tech}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Reality & Scope Disclosure */}
        <section className="glass-panel border-border/50 bg-card/30 p-8 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            Project Scope & Honest Technical Notes
          </div>

          <h3 className="text-2xl font-heading font-bold text-foreground">
            What This Project Is — and What It Isn't
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <p>
                <strong>Independent Student / Portfolio Project:</strong> ArtifactVault is a personal software development project created to explore computer vision, vector similarity search, and WebGL graphics. It is not an enterprise startup, has no external venture backing, and holds no corporate partnerships with institutions like UNESCO or the Smithsonian.
              </p>
              <p>
                <strong>Security & Auth Scope:</strong> User authentication is implemented using standard JWTs signed on the backend and passwords hashed with bcrypt (salt rounds = 10). It is tailored for portfolio demonstration and local deployment, not high-assurance bank-grade banking environments.
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <strong>3D Mesh Rendering Note:</strong> True multi-view neural photogrammetric 3D mesh reconstruction from single 2D photographs requires significant GPU cloud compute (e.g. NeRFs or Gaussian Splatting). The current viewer renders an interactive 3D spatial geometry with dynamic OrbitControls, Three.js studio lighting, and texture mapping as an accessible client-side demonstration.
              </p>
              <p>
                <strong>Vector Search Scaling:</strong> Similarity search runs server-side in-memory cosine similarity across Gemini text embeddings. This is efficient and responsive for collections up to several thousand relics without the overhead of maintaining an external vector database cluster.
              </p>
            </div>
          </div>
        </section>

        {/* Creator Bio Section */}
        <section className="p-6 sm:p-7 rounded-xl border border-border/50 bg-gradient-to-r from-card/90 via-card to-primary/5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/20 via-amber-500/10 to-amber-200/20 border border-primary/30 flex items-center justify-center font-heading font-bold text-base text-primary shadow-sm shrink-0">
              DM
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                Creator & Developer
              </span>
              <h3 className="text-xl font-heading font-bold text-foreground">
                Dheeraj Mahale
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full-Stack & Data Science Student Developer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={() => window.open("https://github.com/dheerajkmahale/ArtifactVault", "_blank")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 shadow-md shadow-primary/20 flex-1 sm:flex-none"
            >
              <Github className="w-3.5 h-3.5 mr-1.5" />
              GitHub Repository
              <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/gallery")}
              className="border-border/60 hover:bg-muted text-xs h-9 px-4 flex-1 sm:flex-none"
            >
              Browse Gallery
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/30 py-8 bg-card/20">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-primary" />
            <span className="font-heading font-semibold text-foreground">ArtifactVault</span>
            <span>— Digital Cultural Preservation Studio</span>
          </div>
          <p className="font-mono">
            Independent Engineering Project · Full-Stack MERN & Gemini Vision
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
