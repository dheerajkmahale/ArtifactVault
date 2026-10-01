import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api";
import {
  Search,
  Eye,
  Loader2,
  Trash2,
  Upload,
  Sparkles,
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  Clock,
  Box,
  ArrowUpDown,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Ceramic Pottery",
  "Bronze Weapon",
  "Gold Jewelry",
  "Stone Sculpture",
  "Ritual Vessel",
  "Ancient Coin",
];

const Gallery = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "confidence", "alphabetical"
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      const data = await api.artifacts.getAll();
      setArtifacts(data || []);
    } catch (error) {
      console.error("Error fetching artifacts:", error);
      toast.error(error.message || "Failed to load artifacts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this artifact from the vault?")) {
      return;
    }

    try {
      setDeletingId(id);
      await api.artifacts.delete(id);
      setArtifacts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Artifact deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete artifact");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to safely get classification category
  const getCategory = (art) => {
    if (!art.classification) return "Artifact";
    if (typeof art.classification === "string") return art.classification;
    return art.classification.category || "Artifact";
  };

  const getEra = (art) => {
    if (typeof art.classification === "object" && art.classification?.era) {
      return art.classification.era;
    }
    return art.metadata?.estimatedEra || "Historical";
  };

  // Filtered and Sorted artifacts
  const sortedAndFilteredArtifacts = useMemo(() => {
    const filtered = artifacts.filter((artifact) => {
      const category = getCategory(artifact).toLowerCase();
      const title = (artifact.title || "").toLowerCase();
      const desc = (artifact.description || "").toLowerCase();
      const era = getEra(artifact).toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        desc.includes(search) ||
        category.includes(search) ||
        era.includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        category.includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateA - dateB;
      }
      if (sortBy === "confidence") {
        const confA = a.classification?.confidence || 0;
        const confB = b.classification?.confidence || 0;
        return confB - confA;
      }
      if (sortBy === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [artifacts, searchTerm, selectedCategory, sortBy]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Artifact Archive & Gallery
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Explore digitized 3D cultural heritage, vector embeddings, and Gemini AI curatorial analyses
              </p>
            </div>

            <Button
              onClick={() => navigate("/upload")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 shrink-0 self-start md:self-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              Scan New Relic
            </Button>
          </div>

          {/* Search Bar, Sort Dropdown & Category Filter Pills */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="input-gallery-search"
                  placeholder="Search by title, category, era, or material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/60 border-border/50 backdrop-blur-md focus:border-primary/50 h-11"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <select
                  id="select-gallery-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 px-3.5 rounded-md bg-card/70 border border-border/50 text-foreground text-xs font-medium focus:outline-none focus:border-primary/60 cursor-pointer"
                >
                  <option value="newest" className="bg-background text-foreground">Sort: Newest</option>
                  <option value="oldest" className="bg-background text-foreground">Sort: Oldest</option>
                  <option value="confidence" className="bg-background text-foreground">Sort: Highest Confidence</option>
                  <option value="alphabetical" className="bg-background text-foreground">Sort: Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-black font-semibold shadow-md shadow-primary/20"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-mono text-muted-foreground">Retrieving vaulted artifacts...</p>
            </div>
          ) : sortedAndFilteredArtifacts.length === 0 ? (
            <Card className="glass-panel border-border/50 bg-card/40 p-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                {searchTerm || selectedCategory !== "All"
                  ? "No matching artifacts found"
                  : "Your vault is currently empty"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== "All"
                  ? "Try adjusting your search keywords or active category filter."
                  : "Upload a photograph to trigger Gemini vision classification and interactive 3D spatial viewing."}
              </p>
              {searchTerm || selectedCategory !== "All" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                >
                  Reset Filters
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/upload")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Artifact
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="gallery-grid">
              {sortedAndFilteredArtifacts.map((artifact) => {
                const category = getCategory(artifact);
                const era = getEra(artifact);
                const isDeleting = deletingId === artifact.id;
                const isVerified = !!artifact.curatorVerified;

                return (
                  <Card
                    key={artifact.id}
                    onClick={() => navigate(`/viewer?id=${artifact.id}`)}
                    className="glass-card group border-border/50 bg-card/50 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {/* Image Preview with Floating Badges */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
                      <img
                        src={artifact.original_image_url}
                        alt={artifact.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Top floating badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-background/85 backdrop-blur-md text-primary border border-primary/30">
                          {category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Curator Verified vs AI Suggested Badge */}
                          {isVerified ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 bg-emerald-500/90 text-black font-semibold shadow-sm">
                              <ShieldCheck className="w-3 h-3" />
                              Curator Verified
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 bg-amber-500/90 text-black font-semibold shadow-sm">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Suggested
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Overlay with Action Buttons */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3.5">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/viewer?id=${artifact.id}`);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Launch 3D
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isDeleting}
                          className="h-8 px-2.5 text-xs bg-destructive/80 hover:bg-destructive"
                          onClick={(e) => handleDelete(e, artifact.id)}
                          title="Delete from Vault"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Metadata Card Content */}
                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-heading font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {artifact.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {artifact.description || "Archival photogrammetric record."}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <Calendar className="w-3 h-3 text-primary/70 shrink-0" />
                          {era}
                        </span>
                        <span>
                          {artifact.classification?.confidence ? (
                            <span className="text-primary font-bold">{artifact.classification.confidence}% Match</span>
                          ) : (
                            artifact.created_at
                              ? new Date(artifact.created_at).toLocaleDateString()
                              : ""
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default Gallery;
