import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  Save,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  Sparkles,
  Eye,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ImmersiveReader from "@/components/ImmersiveReader";

interface Chapter {
  id: string;
  title: string;
  content: string;
  chapter_number: number;
  is_generated: boolean;
}

interface Creation {
  id: string;
  content: string;
  recipient_name: string;
  type: string;
}

const VOICE_OPTIONS = [
  { key: "lily", name: "Lily", gender: "female" },
  { key: "jessica", name: "Jessica", gender: "female" },
  { key: "sarah", name: "Sarah", gender: "female" },
  { key: "alice", name: "Alice", gender: "female" },
  { key: "laura", name: "Laura", gender: "female" },
  { key: "matilda", name: "Matilda", gender: "female" },
  { key: "charlie", name: "Charlie", gender: "male" },
  { key: "george", name: "George", gender: "male" },
  { key: "daniel", name: "Daniel", gender: "male" },
  { key: "liam", name: "Liam", gender: "male" },
  { key: "brian", name: "Brian", gender: "male" },
  { key: "chris", name: "Chris", gender: "male" },
];

const StoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [creation, setCreation] = useState<Creation | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("lily");
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchStoryData();
    }
  }, [user, id]);

  useEffect(() => {
    // Reset audio when chapter changes
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setAudioUrl(null);
  }, [currentChapterIndex]);

  const fetchStoryData = async () => {
    try {
      // Fetch creation
      const { data: creationData, error: creationError } = await supabase
        .from("creations")
        .select("*")
        .eq("id", id)
        .single();

      if (creationError) throw creationError;
      setCreation(creationData);

      // Fetch chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("story_chapters")
        .select("*")
        .eq("creation_id", id)
        .order("chapter_number", { ascending: true });

      if (chaptersError) throw chaptersError;
      setChapters(chaptersData || []);
    } catch (error) {
      console.error("Error fetching story:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger cette histoire.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChapter = async () => {
    const chapter = chapters[currentChapterIndex];
    if (!chapter) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("story_chapters")
        .update({
          title: chapter.title,
          content: chapter.content,
        })
        .eq("id", chapter.id);

      if (error) throw error;

      // Also update the full content in creations table
      const fullContent = chapters.map((c) => `# ${c.title}\n\n${c.content}`).join("\n\n---\n\n");
      await supabase
        .from("creations")
        .update({ content: fullContent })
        .eq("id", id);

      toast({
        title: "Sauvegardé ! 💕",
        description: `Chapitre "${chapter.title}" mis à jour.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save all chapters
      for (const chapter of chapters) {
        await supabase
          .from("story_chapters")
          .update({
            title: chapter.title,
            content: chapter.content,
          })
          .eq("id", chapter.id);
      }

      // Update full content
      const fullContent = chapters.map((c) => `# ${c.title}\n\n${c.content}`).join("\n\n---\n\n");
      await supabase
        .from("creations")
        .update({ content: fullContent })
        .eq("id", id);

      toast({
        title: "Tout sauvegardé ! 💕",
        description: "Tous les chapitres ont été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder tous les chapitres.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateChapterTitle = (title: string) => {
    setChapters(
      chapters.map((c, i) =>
        i === currentChapterIndex ? { ...c, title } : c
      )
    );
  };

  const updateChapterContent = (content: string) => {
    setChapters(
      chapters.map((c, i) =>
        i === currentChapterIndex ? { ...c, content } : c
      )
    );
  };

  const handleGenerateAudio = async () => {
    const chapter = chapters[currentChapterIndex];
    if (!chapter) return;

    setGeneratingAudio(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-chapter-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: chapter.content,
            voiceKey: selectedVoice,
            narratorStyle: "warm",
            useElevenLabs,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la génération audio");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      toast({
        title: "Audio généré ! 🎵",
        description: "Cliquez sur lecture pour écouter.",
      });
    } catch (error) {
      console.error("Audio generation error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'audio.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleRegenerateChapter = async () => {
    const chapter = chapters[currentChapterIndex];
    if (!chapter || !creation) return;

    setRegenerating(true);
    try {
      // Build context from other chapters
      const previousChapters = chapters
        .slice(0, currentChapterIndex)
        .filter((c) => c.content)
        .map((c) => `${c.title}: ${c.content.substring(0, 300)}...`)
        .join("\n\n");

      const upcomingChapters = chapters
        .slice(currentChapterIndex + 1)
        .map((c) => c.title)
        .join(", ");

      const prompt = `
Tu es un auteur de fiction romantique. Réécris le chapitre "${chapter.title}" (chapitre ${chapter.chapter_number} sur ${chapters.length}) d'une histoire d'amour dédiée à ${creation.recipient_name}.

${previousChapters ? `Chapitres précédents:\n${previousChapters}\n` : "C'est le premier chapitre."}
${upcomingChapters ? `Chapitres à venir: ${upcomingChapters}` : ""}

Écris un chapitre de 400-600 mots, romantique et captivant.
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
            recipientName: creation.recipient_name,
            tone: "romantique",
            details: prompt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la régénération");
      }

      const data = await response.json();
      updateChapterContent(data.content);

      toast({
        title: "Chapitre régénéré ! ✨",
        description: "N'oubliez pas de sauvegarder.",
      });
    } catch (error) {
      console.error("Regeneration error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de régénérer le chapitre.",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const chapter = chapters[currentChapterIndex];
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `chapitre-${chapter?.chapter_number || currentChapterIndex + 1}.mp3`;
    a.click();
  };

  const chapter = chapters[currentChapterIndex];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!creation || chapters.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun chapitre trouvé pour cette histoire.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Immersive Reader Modal */}
      <ImmersiveReader
        title={creation.type === "story" ? "Histoire d'amour" : creation.type}
        recipientName={creation.recipient_name}
        chapters={chapters}
        isOpen={showReader}
        onClose={() => setShowReader(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-display text-foreground">
              Édition - {creation.recipient_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReader(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Mode lecture
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "..." : "Tout sauvegarder"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chapter List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-4 sticky top-24">
              <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Chapitres
              </h3>
              
              <div className="space-y-2">
                {chapters.map((ch, index) => (
                  <button
                    key={ch.id}
                    onClick={() => setCurrentChapterIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      currentChapterIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{ch.chapter_number}.</span>{" "}
                    <span className="truncate">{ch.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <motion.div
            key={currentChapterIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
              {/* Chapter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
                    disabled={currentChapterIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Chapitre {chapter?.chapter_number} / {chapters.length}
                    </span>
                    <Input
                      value={chapter?.title || ""}
                      onChange={(e) => updateChapterTitle(e.target.value)}
                      className="text-xl font-display bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))}
                    disabled={currentChapterIndex === chapters.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateChapter}
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Régénérer
                  </Button>
                  <Button
                    onClick={handleSaveChapter}
                    disabled={saving}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </div>

              {/* Content Editor */}
              <Textarea
                value={chapter?.content || ""}
                onChange={(e) => updateChapterContent(e.target.value)}
                className="min-h-[400px] bg-background/50 border-border/50 font-serif text-lg leading-relaxed resize-y"
                placeholder="Le contenu du chapitre..."
              />

              {/* Audio Section */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-primary" />
                    Version audio du chapitre
                  </h4>
                  
                  <div className="flex items-center gap-2">
                    {/* Voice Settings */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Voix
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64" align="end">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Sélectionner la voix</label>
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                                  Voix féminines
                                </div>
                                {VOICE_OPTIONS.filter((v) => v.gender === "female").map((voice) => (
                                  <SelectItem key={voice.key} value={voice.key}>
                                    {voice.name}
                                  </SelectItem>
                                ))}
                                <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-2">
                                  Voix masculines
                                </div>
                                {VOICE_OPTIONS.filter((v) => v.gender === "male").map((voice) => (
                                  <SelectItem key={voice.key} value={voice.key}>
                                    {voice.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">ElevenLabs</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUseElevenLabs(!useElevenLabs)}
                            >
                              {useElevenLabs ? "Activé" : "Fallback"}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {audioUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={togglePlayAudio}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Écouter
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadAudio}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={handleGenerateAudio}
                      disabled={generatingAudio}
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-white"
                    >
                      {generatingAudio ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          {audioUrl ? "Régénérer" : "Générer audio"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Convertissez ce chapitre en narration vocale avec votre voix préférée.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default StoryEdit;
