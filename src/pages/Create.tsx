import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  Sparkles,
  PenLine,
  BookOpen,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import StoryBuilder from "@/components/StoryBuilder";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  isGenerated: boolean;
}

const Create = () => {
  const [type, setType] = useState<string>("poem");
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [tone, setTone] = useState("romantic");
  const [details, setDetails] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleGenerate = async () => {
    if (!recipientName.trim()) {
      toast({
        title: "Nom requis",
        description: "Entrez le prénom de la personne.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-love-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type,
            recipientName,
            occasion: occasion || undefined,
            tone,
            details: details || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      setGeneratedContent(data.content);

      toast({
        title: "Généré avec amour ! 💖",
        description: "Votre création est prête. Vous pouvez l'éditer avant de sauvegarder.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer le contenu.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent.trim()) {
      toast({
        title: "Contenu vide",
        description: "Générez d'abord un contenu.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.from("creations").insert({
        user_id: user?.id,
        type,
        recipient_name: recipientName,
        occasion: occasion || null,
        tone,
        content: generatedContent,
      }).select().single();

      if (error) throw error;

      toast({
        title: "Sauvegardé ! 💕",
        description: "Votre création est enregistrée.",
      });

      navigate(`/edit/${data.id}`);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStoryComplete = async (chapters: Chapter[]) => {
    if (!recipientName.trim()) {
      toast({
        title: "Nom requis",
        description: "Entrez le prénom de la personne.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Combine all chapters into one content for the main creation
      const fullContent = chapters
        .map((c) => `## ${c.title}\n\n${c.content}`)
        .join("\n\n---\n\n");

      // Create the main story
      const { data: creation, error: creationError } = await supabase
        .from("creations")
        .insert({
          user_id: user?.id,
          type: "story",
          recipient_name: recipientName,
          occasion: occasion || null,
          tone,
          content: fullContent,
        })
        .select()
        .single();

      if (creationError) throw creationError;

      // Save individual chapters
      const chaptersToInsert = chapters.map((c) => ({
        creation_id: creation.id,
        chapter_number: c.number,
        title: c.title,
        content: c.content,
        is_generated: c.isGenerated,
      }));

      const { error: chaptersError } = await supabase
        .from("story_chapters")
        .insert(chaptersToInsert);

      if (chaptersError) throw chaptersError;

      toast({
        title: "Histoire sauvegardée ! 📖",
        description: `${chapters.length} chapitres enregistrés avec succès.`,
      });

      navigate(`/edit/${creation.id}`);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'histoire.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const typeOptions = [
    { value: "poem", label: "Poème d'amour", icon: PenLine, emoji: "📜" },
    { value: "letter", label: "Lettre d'amour", icon: Send, emoji: "💌" },
    { value: "story", label: "Histoire d'amour", icon: BookOpen, emoji: "📖" },
    { value: "message", label: "Message d'amour", icon: Heart, emoji: "💕" },
  ];

  const toneOptions = [
    { value: "romantic", label: "Romantique" },
    { value: "tender", label: "Tendre" },
    { value: "passionate", label: "Passionné" },
    { value: "playful", label: "Espiègle" },
    { value: "poetic", label: "Poétique" },
  ];

  const occasionOptions = [
    { value: "", label: "Aucune occasion particulière" },
    { value: "anniversaire", label: "Anniversaire" },
    { value: "saint-valentin", label: "Saint-Valentin" },
    { value: "mariage", label: "Mariage" },
    { value: "rencontre", label: "Première rencontre" },
    { value: "reconciliation", label: "Réconciliation" },
    { value: "declaration", label: "Déclaration d'amour" },
    { value: "quotidien", label: "Moment du quotidien" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
            Créer une nouvelle œuvre
          </h1>
          <p className="text-muted-foreground">
            Laissez l'IA écrire un message d'amour personnalisé
          </p>
        </motion.div>

        {/* Story Builder Mode */}
        {type === "story" ? (
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6"
            >
              {/* Basic settings for story */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border/50">
                <div>
                  <Label htmlFor="recipientName" className="text-foreground">
                    Prénom du/de la destinataire <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Marie, Lucas..."
                    className="mt-2 bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Ton</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="mt-2 bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground">Occasion</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger className="mt-2 bg-background/50 border-border/50">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value || "none"}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="details" className="text-foreground">
                  Détails personnels pour enrichir l'histoire (optionnel)
                </Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Souvenirs partagés, lieux importants, anecdotes romantiques..."
                  className="mt-2 bg-background/50 border-border/50 min-h-[80px]"
                />
              </div>

              <StoryBuilder
                recipientName={recipientName}
                tone={tone}
                occasion={occasion}
                details={details}
                onComplete={handleStoryComplete}
              />
            </motion.div>

            {/* Type switcher */}
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => setType("poem")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Changer de type de création
              </button>
            </div>
          </div>
        ) : (
          /* Standard creation mode */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6"
            >
              <h2 className="text-xl font-display text-foreground mb-6">Paramètres</h2>

              {/* Type Selection */}
              <div className="mb-6">
                <Label className="text-foreground mb-3 block">Type de création</Label>
                <div className="grid grid-cols-2 gap-3">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        type === option.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{option.emoji}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Name */}
              <div className="mb-6">
                <Label htmlFor="recipientName" className="text-foreground">
                  Prénom de la personne <span className="text-primary">*</span>
                </Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Marie, Lucas, Chéri(e)..."
                  className="mt-2 bg-background/50 border-border/50"
                />
              </div>

              {/* Occasion */}
              <div className="mb-6">
                <Label className="text-foreground">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger className="mt-2 bg-background/50 border-border/50">
                    <SelectValue placeholder="Choisir une occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {occasionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value || "none"}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="mb-6">
                <Label className="text-foreground">Ton</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-2 bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Details */}
              <div className="mb-6">
                <Label htmlFor="details" className="text-foreground">
                  Détails personnels (optionnel)
                </Label>
                <Textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Souvenirs partagés, qualités de la personne, anecdotes..."
                  className="mt-2 bg-background/50 border-border/50 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !recipientName.trim()}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Générer avec l'IA
                  </>
                )}
              </Button>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6"
            >
              <h2 className="text-xl font-display text-foreground mb-6">Aperçu</h2>

              {generatedContent ? (
                <>
                  <div className="bg-background/50 rounded-xl p-6 min-h-[300px] max-h-[500px] overflow-y-auto mb-6">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed font-serif">
                      {generatedContent}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Régénérer
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                    >
                      {isSaving ? (
                        "Sauvegarde..."
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground">
                  <Heart className="w-16 h-16 text-primary/20 mb-4" />
                  <p>
                    Remplissez les paramètres et cliquez sur "Générer" pour créer
                    votre message d'amour personnalisé.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Create;
