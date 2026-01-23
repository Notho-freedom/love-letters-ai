import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  PenLine,
  Send,
  BookOpen,
  Sparkles,
  Crown,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  content: string;
  tone: string;
  occasion: string | null;
  emoji: string;
  is_premium: boolean;
}

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("is_premium", { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // For premium templates, check subscription
    if (template.is_premium) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();

      if (!profile?.is_premium) {
        toast({
          title: "Template Premium 💎",
          description: "Passez à Premium pour utiliser ce template.",
        });
        navigate("/pricing");
        return;
      }
    }

    // Store template in session storage and redirect to create
    sessionStorage.setItem("template", JSON.stringify(template));
    navigate("/create");
  };

  const typeLabels: Record<string, string> = {
    poem: "Poème",
    letter: "Lettre",
    story: "Histoire",
    message: "Message",
  };

  const typeIcons: Record<string, any> = {
    poem: PenLine,
    letter: Send,
    story: BookOpen,
    message: Heart,
  };

  const filteredTemplates = templates.filter(
    (t) => filterType === "all" || t.type === filterType
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <a href="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-xl font-display text-foreground">LoveSpace</span>
          </a>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Templates d'Amour
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Inspirez-vous de nos modèles pour créer des messages uniques
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {["all", "poem", "letter", "story", "message"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "all" ? "Tous" : typeLabels[type]}
            </button>
          ))}
        </motion.div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Heart className="w-12 h-12 text-primary animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, index) => {
              const IconComponent = typeIcons[template.type] || Heart;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-card/50 backdrop-blur border rounded-2xl p-6 hover:border-primary/30 transition-all group ${
                    template.is_premium
                      ? "border-accent/50"
                      : "border-border/50"
                  }`}
                >
                  {template.is_premium && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-gradient-to-r from-accent to-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{template.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg text-foreground mb-1">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconComponent className="w-4 h-4" />
                        <span>{typeLabels[template.type]}</span>
                        {template.occasion && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{template.occasion}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>

                  <div className="bg-background/50 rounded-xl p-4 mb-4 max-h-32 overflow-hidden relative">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap font-serif italic line-clamp-4">
                      {template.content}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/50 to-transparent" />
                  </div>

                  <Button
                    onClick={() => handleUseTemplate(template)}
                    variant={template.is_premium ? "outline" : "romantic"}
                    className="w-full"
                  >
                    {template.is_premium ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Débloquer avec Premium
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Utiliser ce template
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Templates;
