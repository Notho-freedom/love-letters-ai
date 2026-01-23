import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Search, Filter, ThumbsUp, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PublicCreation {
  id: string;
  type: string;
  recipient_name: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

const Gallery = () => {
  const [creations, setCreations] = useState<PublicCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [selectedCreation, setSelectedCreation] = useState<PublicCreation | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPublicCreations();
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  const fetchPublicCreations = async () => {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select(`
          id,
          type,
          recipient_name,
          content,
          likes_count,
          created_at,
          user_id
        `)
        .eq("is_public", true)
        .order("likes_count", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      
      const creationsWithProfiles = (data || []).map(c => ({
        ...c,
        profiles: { full_name: profilesMap.get(c.user_id) || null }
      }));
      
      setCreations(creationsWithProfiles);
    } catch (error) {
      console.error("Error fetching creations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("creation_likes")
        .select("creation_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserLikes(new Set(data?.map((l) => l.creation_id) || []));
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLike = async (creationId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour aimer cette création.",
        variant: "destructive",
      });
      return;
    }

    const isLiked = userLikes.has(creationId);

    try {
      if (isLiked) {
        await supabase
          .from("creation_likes")
          .delete()
          .eq("creation_id", creationId)
          .eq("user_id", user.id);

        setUserLikes((prev) => {
          const next = new Set(prev);
          next.delete(creationId);
          return next;
        });
        setCreations((prev) =>
          prev.map((c) =>
            c.id === creationId ? { ...c, likes_count: c.likes_count - 1 } : c
          )
        );
      } else {
        await supabase.from("creation_likes").insert({
          creation_id: creationId,
          user_id: user.id,
        });

        setUserLikes((prev) => new Set(prev).add(creationId));
        setCreations((prev) =>
          prev.map((c) =>
            c.id === creationId ? { ...c, likes_count: c.likes_count + 1 } : c
          )
        );
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le like.",
        variant: "destructive",
      });
    }
  };

  const typeLabels: Record<string, string> = {
    poem: "Poème",
    letter: "Lettre",
    story: "Histoire",
    message: "Message",
  };

  const typeEmojis: Record<string, string> = {
    poem: "📜",
    letter: "💌",
    story: "📖",
    message: "💕",
  };

  const filteredCreations = creations.filter((c) => {
    const matchesSearch =
      c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Galerie de l'Amour
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez les plus belles créations partagées par notre communauté
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48 bg-card/50 border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="poem">Poèmes</SelectItem>
              <SelectItem value="letter">Lettres</SelectItem>
              <SelectItem value="story">Histoires</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Heart className="w-12 h-12 text-primary animate-pulse" />
          </div>
        ) : filteredCreations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Heart className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h2 className="text-xl text-foreground mb-2">Aucune création publique</h2>
            <p className="text-muted-foreground">
              Soyez le premier à partager votre création !
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCreations.map((creation, index) => (
              <motion.div
                key={creation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setSelectedCreation(creation)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeEmojis[creation.type]}</span>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {typeLabels[creation.type]}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Pour {creation.recipient_name}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-4 mb-4 font-serif italic">
                  "{creation.content.substring(0, 150)}..."
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{creation.profiles?.full_name || "Anonyme"}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(creation.id);
                      }}
                      className={`flex items-center gap-1 transition-colors ${
                        userLikes.has(creation.id)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${
                          userLikes.has(creation.id) ? "fill-current" : ""
                        }`}
                      />
                      <span className="text-sm">{creation.likes_count}</span>
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for full view */}
        {selectedCreation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedCreation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{typeEmojis[selectedCreation.type]}</span>
                <div>
                  <h2 className="text-2xl font-display text-foreground">
                    {typeLabels[selectedCreation.type]} pour {selectedCreation.recipient_name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Par {selectedCreation.profiles?.full_name || "Anonyme"} •{" "}
                    {format(new Date(selectedCreation.created_at), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-background/50 rounded-xl p-6 mb-6">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed font-serif text-lg">
                  {selectedCreation.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(selectedCreation.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    userLikes.has(selectedCreation.id)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground hover:text-primary"
                  }`}
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${
                      userLikes.has(selectedCreation.id) ? "fill-current" : ""
                    }`}
                  />
                  <span>{selectedCreation.likes_count} J'aime</span>
                </button>

                <Button variant="ghost" onClick={() => setSelectedCreation(null)}>
                  Fermer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
