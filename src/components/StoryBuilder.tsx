import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
  Loader2,
  GripVertical,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  isGenerated: boolean;
}

interface StoryBuilderProps {
  recipientName: string;
  tone: string;
  occasion: string;
  details: string;
  onComplete: (chapters: Chapter[]) => void;
}

const StoryBuilder = ({
  recipientName,
  tone,
  occasion,
  details,
  onComplete,
}: StoryBuilderProps) => {
  const [step, setStep] = useState<"structure" | "generate">("structure");
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: crypto.randomUUID(), number: 1, title: "Prologue", content: "", isGenerated: false },
    { id: crypto.randomUUID(), number: 2, title: "La rencontre", content: "", isGenerated: false },
    { id: crypto.randomUUID(), number: 3, title: "L'éveil des sentiments", content: "", isGenerated: false },
  ]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const { toast } = useToast();

  const addChapter = () => {
    const newNumber = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        id: crypto.randomUUID(),
        number: newNumber,
        title: `Chapitre ${newNumber}`,
        content: "",
        isGenerated: false,
      },
    ]);
  };

  const removeChapter = (id: string) => {
    if (chapters.length <= 1) {
      toast({
        title: "Minimum atteint",
        description: "Une histoire doit avoir au moins un chapitre.",
        variant: "destructive",
      });
      return;
    }
    const filtered = chapters.filter((c) => c.id !== id);
    // Renumber
    const renumbered = filtered.map((c, i) => ({ ...c, number: i + 1 }));
    setChapters(renumbered);
    if (currentChapterIndex >= renumbered.length) {
      setCurrentChapterIndex(renumbered.length - 1);
    }
  };

  const moveChapter = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= chapters.length) return;

    const newChapters = [...chapters];
    [newChapters[index], newChapters[newIndex]] = [newChapters[newIndex], newChapters[index]];
    // Renumber
    const renumbered = newChapters.map((c, i) => ({ ...c, number: i + 1 }));
    setChapters(renumbered);
  };

  const updateChapterTitle = (id: string, title: string) => {
    setChapters(chapters.map((c) => (c.id === id ? { ...c, title } : c)));
  };

  const updateChapterContent = (id: string, content: string) => {
    setChapters(chapters.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const generateChapter = async (index: number) => {
    const chapter = chapters[index];
    if (!chapter) return;

    setIsGenerating(true);
    try {
      // Build context from previous chapters
      const previousChapters = chapters
        .slice(0, index)
        .filter((c) => c.isGenerated && c.content)
        .map((c) => `${c.title}: ${c.content.substring(0, 500)}...`)
        .join("\n\n");

      const upcomingChapters = chapters
        .slice(index + 1)
        .map((c) => c.title)
        .join(", ");

      const prompt = `
Écris le chapitre "${chapter.title}" (chapitre ${chapter.number} sur ${chapters.length}) d'une histoire d'amour pour ${recipientName}.

${previousChapters ? `Résumé des chapitres précédents:\n${previousChapters}\n\n` : ""}
${upcomingChapters ? `Chapitres à venir: ${upcomingChapters}\n\n` : ""}
Ton: ${tone}
${occasion ? `Occasion: ${occasion}` : ""}
${details ? `Détails personnels: ${details}` : ""}

Le chapitre doit être cohérent avec l'histoire, bien développé et touchant. Écris environ 300-500 mots.
      `.trim();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-love-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: "story",
            recipientName,
            occasion: occasion || undefined,
            tone,
            details: prompt,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération");
      }

      const data = await response.json();
      
      setChapters(
        chapters.map((c) =>
          c.id === chapter.id ? { ...c, content: data.content, isGenerated: true } : c
        )
      );

      toast({
        title: "Chapitre généré ! 📖",
        description: `"${chapter.title}" est prêt.`,
      });

      // Auto-advance to next chapter if available
      if (index < chapters.length - 1) {
        setCurrentChapterIndex(index + 1);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer le chapitre.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const allChaptersGenerated = chapters.every((c) => c.isGenerated && c.content);

  const handleComplete = () => {
    onComplete(chapters);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setStep("structure")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            step === "structure"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm">
            1
          </span>
          Structure
        </button>
        <div className="w-8 h-0.5 bg-border" />
        <button
          onClick={() => chapters.length > 0 && setStep("generate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            step === "generate"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm">
            2
          </span>
          Génération
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === "structure" ? (
          <motion.div
            key="structure"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display text-foreground">
                Définissez vos chapitres
              </h3>
              <span className="text-sm text-muted-foreground">
                {chapters.length} chapitre{chapters.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-2 bg-background/50 rounded-lg p-3 border border-border/50"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-primary w-8">
                    {chapter.number}.
                  </span>

                  {editingTitle === chapter.id ? (
                    <Input
                      value={chapter.title}
                      onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                      onBlur={() => setEditingTitle(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingTitle(null)}
                      autoFocus
                      className="flex-1 h-8"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingTitle(chapter.id)}
                      className="flex-1 text-left text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {chapter.title}
                      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveChapter(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveChapter(index, "down")}
                      disabled={index === chapters.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeChapter(chapter.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addChapter}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un chapitre
            </Button>

            <Button
              onClick={() => setStep("generate")}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white mt-4"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Passer à la génération
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Chapter navigation */}
            <div className="flex flex-wrap gap-2 mb-4">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => setCurrentChapterIndex(index)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    currentChapterIndex === index
                      ? "bg-primary text-primary-foreground"
                      : chapter.isGenerated
                      ? "bg-green-500/20 text-green-600 border border-green-500/50"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {chapter.isGenerated && <Check className="w-3 h-3" />}
                  <span>{chapter.number}. {chapter.title}</span>
                </button>
              ))}
            </div>

            {/* Current chapter editor */}
            {chapters[currentChapterIndex] && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display text-foreground">
                    {chapters[currentChapterIndex].number}. {chapters[currentChapterIndex].title}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    Chapitre {currentChapterIndex + 1} / {chapters.length}
                  </span>
                </div>

                <Textarea
                  value={chapters[currentChapterIndex].content}
                  onChange={(e) =>
                    updateChapterContent(chapters[currentChapterIndex].id, e.target.value)
                  }
                  placeholder="Le contenu du chapitre apparaîtra ici après génération. Vous pouvez aussi écrire manuellement."
                  className="min-h-[300px] bg-background/50 border-border/50 font-serif"
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("structure")}
                    className="flex-1"
                  >
                    Modifier la structure
                  </Button>
                  <Button
                    onClick={() => generateChapter(currentChapterIndex)}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : chapters[currentChapterIndex].isGenerated ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Régénérer
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer ce chapitre
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Progress and complete */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {chapters.filter((c) => c.isGenerated).length} / {chapters.length} chapitres générés
                </span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{
                      width: `${(chapters.filter((c) => c.isGenerated).length / chapters.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={handleComplete}
                disabled={!allChaptersGenerated}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                {allChaptersGenerated ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Sauvegarder l'histoire
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Générez tous les chapitres pour continuer
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryBuilder;
