import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Plus,
  Edit3,
  Trash2,
  Volume2,
  Send,
  Calendar,
  LogOut,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Creation {
  id: string;
  type: string;
  recipient_name: string;
  occasion: string | null;
  tone: string;
  content: string;
  audio_url: string | null;
  is_sent: boolean;
  scheduled_at: string | null;
  created_at: string;
}

const Dashboard = () => {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  const fetchCreations = async () => {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCreations(data || []);
    } catch (error) {
      console.error("Error fetching creations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos créations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("creations").delete().eq("id", id);
      if (error) throw error;

      setCreations(creations.filter((c) => c.id !== id));
      toast({
        title: "Supprimé",
        description: "Votre création a été supprimée.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Heart className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-xl font-display text-foreground">LoveSpace</span>
          </a>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Title & New Creation Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
              Mes Créations
            </h1>
            <p className="text-muted-foreground">
              {creations.length} création{creations.length !== 1 ? "s" : ""} d'amour
            </p>
          </div>
          <Button
            onClick={() => navigate("/create")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle création
          </Button>
        </div>

        {/* Creations Grid */}
        {creations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Heart className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h2 className="text-xl text-foreground mb-2">Aucune création pour le moment</h2>
            <p className="text-muted-foreground mb-6">
              Créez votre premier poème, lettre ou message d'amour !
            </p>
            <Button
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Commencer
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creations.map((creation, index) => (
              <motion.div
                key={creation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeEmojis[creation.type]}</span>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {typeLabels[creation.type] || creation.type}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Pour {creation.recipient_name}
                      </p>
                    </div>
                  </div>
                  {creation.is_sent && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Envoyé
                    </span>
                  )}
                  {creation.scheduled_at && !creation.is_sent && (
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Programmé
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm line-clamp-4 mb-4">
                  {creation.content}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>
                    {format(new Date(creation.created_at), "d MMM yyyy", { locale: fr })}
                  </span>
                  {creation.occasion && (
                    <span className="bg-muted/50 px-2 py-1 rounded">
                      {creation.occasion}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/edit/${creation.id}`)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Éditer
                  </Button>
                  {creation.audio_url && (
                    <Button variant="ghost" size="icon" className="text-accent">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(creation.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
