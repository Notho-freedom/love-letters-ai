import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Settings,
  Moon,
  Sun,
  Type,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: string;
  title: string;
  content: string;
  chapter_number: number;
}

interface ImmersiveReaderProps {
  title: string;
  recipientName: string;
  chapters: Chapter[];
  isOpen: boolean;
  onClose: () => void;
}

const VOICE_OPTIONS = [
  // Female voices
  { key: "lily", name: "Lily", gender: "female", description: "Douce et intime" },
  { key: "jessica", name: "Jessica", gender: "female", description: "Chaleureuse" },
  { key: "sarah", name: "Sarah", gender: "female", description: "Passionnée" },
  { key: "alice", name: "Alice", gender: "female", description: "Dramatique" },
  { key: "laura", name: "Laura", gender: "female", description: "Intime" },
  { key: "matilda", name: "Matilda", gender: "female", description: "Narratrice" },
  // Male voices
  { key: "charlie", name: "Charlie", gender: "male", description: "Chaleureux" },
  { key: "george", name: "George", gender: "male", description: "Dramatique" },
  { key: "daniel", name: "Daniel", gender: "male", description: "Passionné" },
  { key: "liam", name: "Liam", gender: "male", description: "Doux" },
  { key: "brian", name: "Brian", gender: "male", description: "Narrateur" },
  { key: "chris", name: "Chris", gender: "male", description: "Intime" },
];

const NARRATOR_STYLES = [
  { key: "warm", name: "Chaleureux", description: "Ton accueillant et réconfortant" },
  { key: "dramatic", name: "Dramatique", description: "Expressif et théâtral" },
  { key: "soft", name: "Doux", description: "Murmures et tendresse" },
  { key: "passionate", name: "Passionné", description: "Intense et émotionnel" },
];

const ImmersiveReader = ({
  title,
  recipientName,
  chapters,
  isOpen,
  onClose,
}: ImmersiveReaderProps) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("lily");
  const [narratorStyle, setNarratorStyle] = useState("warm");
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset audio when chapter changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setAudioUrl(null);
    setProgress(0);
    
    // Scroll to top of content
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    }
  }, [currentChapter]);

  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const generateAudio = async () => {
    const chapter = chapters[currentChapter];
    if (!chapter) return;

    setIsLoading(true);
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
            narratorStyle,
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
        description: `Chapitre "${chapter.title}" prêt à écouter.`,
      });
    } catch (error) {
      console.error("Audio generation error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'audio. Vérifiez la configuration ElevenLabs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      generateAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    
    // Auto-advance to next chapter
    if (currentChapter < chapters.length - 1) {
      setTimeout(() => {
        setCurrentChapter(currentChapter + 1);
        toast({
          title: "Chapitre suivant 📖",
          description: `Passage au chapitre ${currentChapter + 2}`,
        });
      }, 2000);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${title}-chapitre-${currentChapter + 1}.mp3`;
    a.click();
  };

  const chapter = chapters[currentChapter];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 ${
          darkMode ? "bg-zinc-950" : "bg-amber-50"
        } transition-colors duration-500`}
      >
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
          />
        )}

        {/* Top Bar */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 left-0 right-0 z-10 px-4 py-3 ${
            darkMode ? "bg-zinc-950/90" : "bg-amber-50/90"
          } backdrop-blur-xl border-b ${
            darkMode ? "border-zinc-800" : "border-amber-200"
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={darkMode ? "text-zinc-400 hover:text-white" : "text-amber-800"}
              >
                <X className="w-5 h-5" />
              </Button>
              <div>
                <h1
                  className={`text-lg font-display ${
                    darkMode ? "text-white" : "text-amber-900"
                  }`}
                >
                  {title}
                </h1>
                <p className={`text-sm ${darkMode ? "text-zinc-500" : "text-amber-600"}`}>
                  Pour {recipientName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chapter Selector */}
              <Select
                value={currentChapter.toString()}
                onValueChange={(v) => setCurrentChapter(parseInt(v))}
              >
                <SelectTrigger className={`w-40 ${darkMode ? "bg-zinc-900 border-zinc-700" : "bg-white border-amber-200"}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch, i) => (
                    <SelectItem key={ch.id} value={i.toString()}>
                      {ch.chapter_number}. {ch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Settings Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={darkMode ? "text-zinc-400" : "text-amber-700"}
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Paramètres de lecture</h4>
                    
                    {/* Font Size */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Taille du texte
                        </span>
                        <span className="text-sm">{fontSize}px</span>
                      </div>
                      <Slider
                        value={[fontSize]}
                        min={14}
                        max={28}
                        step={2}
                        onValueChange={([v]) => setFontSize(v)}
                      />
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        Mode sombre
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDarkMode(!darkMode)}
                      >
                        {darkMode ? "Désactiver" : "Activer"}
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-3">Options audio</h5>
                      
                      {/* Voice Selection */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Voix</label>
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
                                {voice.name} - {voice.description}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium mt-2">
                              Voix masculines
                            </div>
                            {VOICE_OPTIONS.filter((v) => v.gender === "male").map((voice) => (
                              <SelectItem key={voice.key} value={voice.key}>
                                {voice.name} - {voice.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Narrator Style */}
                      <div className="space-y-2 mt-3">
                        <label className="text-sm text-muted-foreground">Style de narration</label>
                        <Select value={narratorStyle} onValueChange={setNarratorStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NARRATOR_STYLES.map((style) => (
                              <SelectItem key={style.key} value={style.key}>
                                {style.name} - {style.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* TTS Engine Toggle */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-muted-foreground">
                          Utiliser ElevenLabs
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUseElevenLabs(!useElevenLabs)}
                        >
                          {useElevenLabs ? "Oui" : "Fallback"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div
          ref={contentRef}
          className="h-full overflow-y-auto pt-24 pb-32 px-4"
        >
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            {/* Chapter Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-4 ${
                  darkMode
                    ? "bg-primary/20 text-primary"
                    : "bg-amber-200 text-amber-800"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Chapitre {chapter?.chapter_number} sur {chapters.length}
              </span>
              <h2
                className={`text-3xl md:text-4xl font-display ${
                  darkMode ? "text-white" : "text-amber-900"
                }`}
              >
                {chapter?.title}
              </h2>
            </motion.div>

            {/* Chapter Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`prose max-w-none ${
                darkMode ? "prose-invert" : ""
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {chapter?.content.split("\n").map((paragraph, i) => (
                <p
                  key={i}
                  className={`leading-relaxed mb-6 font-serif ${
                    darkMode ? "text-zinc-300" : "text-amber-950"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </motion.div>

            {/* Chapter Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevChapter}
                disabled={currentChapter === 0}
                className={darkMode ? "border-zinc-700" : "border-amber-300"}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleNextChapter}
                disabled={currentChapter === chapters.length - 1}
                className={darkMode ? "border-zinc-700" : "border-amber-300"}
              >
                Suivant
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Audio Bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className={`fixed bottom-0 left-0 right-0 px-4 py-4 ${
            darkMode ? "bg-zinc-900/95" : "bg-white/95"
          } backdrop-blur-xl border-t ${
            darkMode ? "border-zinc-800" : "border-amber-200"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            {audioUrl && (
              <div className="mb-3">
                <div className={`h-1 rounded-full ${darkMode ? "bg-zinc-700" : "bg-amber-200"}`}>
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Left - Chapter Progress */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevChapter}
                  disabled={currentChapter === 0}
                  className={darkMode ? "text-zinc-400" : "text-amber-700"}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className={`text-sm ${darkMode ? "text-zinc-400" : "text-amber-700"}`}>
                  {currentChapter + 1} / {chapters.length}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextChapter}
                  disabled={currentChapter === chapters.length - 1}
                  className={darkMode ? "text-zinc-400" : "text-amber-700"}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Center - Play Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  size="lg"
                  className="rounded-full w-14 h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
              </div>

              {/* Right - Audio Actions */}
              <div className="flex items-center gap-2">
                {audioUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={downloadAudio}
                    className={darkMode ? "text-zinc-400" : "text-amber-700"}
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !audioRef.current.muted;
                    }
                  }}
                  className={darkMode ? "text-zinc-400" : "text-amber-700"}
                >
                  {audioRef.current?.muted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImmersiveReader;
