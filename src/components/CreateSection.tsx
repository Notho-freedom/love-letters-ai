import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Feather, 
  BookOpen, 
  Mail, 
  MessageCircle,
  Sparkles,
  Calendar,
  Volume2,
  Send
} from "lucide-react";

type ContentType = "poem" | "letter" | "story" | "message";

const contentTypes = [
  { id: "poem" as ContentType, icon: Feather, label: "Poème" },
  { id: "letter" as ContentType, icon: Mail, label: "Lettre" },
  { id: "story" as ContentType, icon: BookOpen, label: "Histoire" },
  { id: "message" as ContentType, icon: MessageCircle, label: "Message" },
];

const CreateSection = () => {
  const [selectedType, setSelectedType] = useState<ContentType>("poem");
  const [recipientName, setRecipientName] = useState("");
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("romantique");
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = [
    "Romantique",
    "Poétique",
    "Passionné",
    "Doux & Tendre",
    "Humoristique",
    "Nostalgique",
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulation - sera remplacé par l'appel API réel
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <section id="create" className="bg-gradient-soft py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-soft px-4 py-2 text-sm font-medium text-rose-dark">
            <Sparkles className="h-4 w-4" />
            Créateur de messages
          </span>
          <h2 className="font-display mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Créez votre{" "}
            <span className="text-gradient-romantic">chef-d'œuvre</span>
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Laissez-nous vous aider à trouver les mots parfaits pour toucher son cœur.
          </p>
        </motion.div>

        {/* Creator Card */}
        <motion.div
          className="mx-auto max-w-4xl rounded-3xl bg-card p-8 shadow-card md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Content Type Selection */}
          <div className="mb-8">
            <label className="mb-4 block text-sm font-medium text-muted-foreground">
              Type de contenu
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all duration-300 ${
                    selectedType === type.id
                      ? "bg-gradient-romantic text-primary-foreground shadow-romantic"
                      : "bg-secondary text-secondary-foreground hover:bg-rose-soft hover:text-rose-dark"
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Prénom de votre bien-aimé(e)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: Marie, Alexandre..."
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-medium/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Style d'écriture
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-medium/20"
              >
                {styles.map((s) => (
                  <option key={s} value={s.toLowerCase()}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Context */}
          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Contexte et détails personnels (optionnel)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Décrivez votre relation, des souvenirs partagés, ce que vous aimez chez cette personne..."
              rows={4}
              className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-rose-deep focus:outline-none focus:ring-2 focus:ring-rose-medium/20"
            />
          </div>

          {/* Options Row */}
          <div className="mb-8 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 py-2 transition-colors hover:bg-rose-soft">
              <input type="checkbox" className="accent-rose-deep" />
              <Calendar className="h-4 w-4 text-rose-deep" />
              <span className="text-sm font-medium">Programmer l'envoi</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 py-2 transition-colors hover:bg-rose-soft">
              <input type="checkbox" className="accent-rose-deep" />
              <Volume2 className="h-4 w-4 text-rose-deep" />
              <span className="text-sm font-medium">Version audio</span>
            </label>
          </div>

          {/* Generate Button */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <Heart className="mr-1 inline h-4 w-4 text-rose-deep" />
              Votre message sera unique et personnel
            </p>
            <Button
              variant="romantic"
              size="xl"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Générer mon {selectedType === "poem" ? "poème" : selectedType === "letter" ? "lettre" : selectedType === "story" ? "histoire" : "message"}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CreateSection;
