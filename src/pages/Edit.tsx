import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  Save,
  Volume2,
  VolumeX,
  Send,
  Calendar,
  Clock,
  Mail,
  Sparkles,
  Download,
  Copy,
  Check,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const Edit = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [type, setType] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingNow, setSendingNow] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
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
      fetchCreation();
    }
  }, [user, id]);

  const fetchCreation = async () => {
    try {
      const { data, error } = await supabase
        .from("creations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setContent(data.content);
      setRecipientName(data.recipient_name);
      setRecipientEmail(data.recipient_email || "");
      setType(data.type);
      setIsPublic(data.is_public || false);
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
      }
    } catch (error) {
      console.error("Error fetching creation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger cette création.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("creations")
        .update({
          content,
          recipient_name: recipientName,
          recipient_email: recipientEmail || null,
          is_public: isPublic,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sauvegardé ! 💕",
        description: "Vos modifications ont été enregistrées.",
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

  const handleGenerateAudio = async () => {
    setGeneratingAudio(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: content }),
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

  const handleSendNow = async () => {
    if (!recipientEmail.trim()) {
      toast({
        title: "Email requis",
        description: "Entrez l'email du destinataire.",
        variant: "destructive",
      });
      return;
    }

    setSendingNow(true);
    try {
      // Save first
      await handleSave();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-love-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            recipientEmail,
            recipientName,
            senderName: user?.user_metadata?.full_name || "Un admirateur",
            content,
            type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      // Update creation as sent
      await supabase
        .from("creations")
        .update({ is_sent: true })
        .eq("id", id);

      toast({
        title: data.demo ? "Email simulé ! 📧" : "Envoyé avec amour ! 💌",
        description: data.demo
          ? "Configurez RESEND_API_KEY pour l'envoi réel."
          : `Votre message a été envoyé à ${recipientEmail}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'envoyer.",
        variant: "destructive",
      });
    } finally {
      setSendingNow(false);
    }
  };

  const handleSchedule = async () => {
    if (!recipientEmail.trim()) {
      toast({
        title: "Email requis",
        description: "Entrez l'email du destinataire.",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: "Date requise",
        description: "Sélectionnez une date d'envoi.",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);
    try {
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const scheduledAt = new Date(scheduledDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Save with scheduled info
      await supabase
        .from("creations")
        .update({
          content,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          scheduled_at: scheduledAt.toISOString(),
        })
        .eq("id", id);

      // Create scheduled email entry
      await supabase.from("scheduled_emails").insert({
        creation_id: id,
        user_id: user?.id,
        recipient_email: recipientEmail,
        scheduled_at: scheduledAt.toISOString(),
      });

      toast({
        title: "Programmé ! 📅",
        description: `Votre message sera envoyé le ${format(scheduledAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de programmer l'envoi.",
        variant: "destructive",
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copié ! 📋",
      description: "Le texte est dans votre presse-papiers.",
    });
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `lovespace-${recipientName.toLowerCase()}.mp3`;
    a.click();
  };

  const typeLabels: Record<string, string> = {
    poem: "Poème",
    letter: "Lettre",
    story: "Histoire",
    message: "Message",
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Heart className="w-12 h-12 text-primary animate-pulse" />
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
          <span className="text-lg font-display text-foreground">
            Édition - {typeLabels[type] || type}
          </span>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "..." : "Sauvegarder"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display text-foreground">Contenu</h2>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copié" : "Copier"}
                </Button>
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] bg-background/50 border-border/50 font-serif text-lg leading-relaxed"
                placeholder="Votre message d'amour..."
              />

              {/* Audio Section */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Version audio</h3>
                  <div className="flex gap-2">
                    {audioUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={togglePlayAudio}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-4 h-4 mr-2" />
                          ) : (
                            <Volume2 className="w-4 h-4 mr-2" />
                          )}
                          {isPlaying ? "Stop" : "Écouter"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadAudio}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
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
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
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
                  Convertissez votre texte en audio avec une voix douce et romantique.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Recipient Info */}
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
              <h3 className="font-display text-lg text-foreground mb-4">
                Destinataire
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipientName" className="text-foreground">
                    Prénom
                  </Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-2 bg-background/50 border-border/50"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientEmail" className="text-foreground">
                    Email
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="pour@amour.fr"
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Public Sharing */}
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
              <h3 className="font-display text-lg text-foreground mb-4">
                Partage public
              </h3>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isPublic
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      {isPublic ? "Public" : "Privé"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isPublic
                        ? "Visible dans la galerie"
                        : "Visible uniquement par vous"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isPublic ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
                      isPublic ? "translate-x-6 ml-0.5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Send Options */}
            <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
              <h3 className="font-display text-lg text-foreground mb-4">
                Envoi
              </h3>

              <div className="space-y-4">
                <Button
                  onClick={handleSendNow}
                  disabled={sendingNow || !recipientEmail}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                >
                  {sendingNow ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer maintenant
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground mb-2 block">
                    Programmer l'envoi
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-background/50 border-border/50"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {scheduledDate
                          ? format(scheduledDate, "d MMMM yyyy", { locale: fr })
                          : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-foreground mb-2 block">Heure</Label>
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <Clock className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSchedule}
                  disabled={scheduling || !recipientEmail || !scheduledDate}
                  variant="outline"
                  className="w-full"
                >
                  {scheduling ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Programmation...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Programmer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Edit;
