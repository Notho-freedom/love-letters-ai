import { Volume2, Mic } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface StoryParametersPanelProps {
  // Story settings
  genre: string;
  setGenre: (value: string) => void;
  era: string;
  setEra: (value: string) => void;
  writingStyle: string;
  setWritingStyle: (value: string) => void;
  pov: string;
  setPov: (value: string) => void;
  intensity: string;
  setIntensity: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  occasion: string;
  setOccasion: (value: string) => void;
  // Audio settings
  enableAudio: boolean;
  setEnableAudio: (value: boolean) => void;
  voiceGender: string;
  setVoiceGender: (value: string) => void;
  narratorStyle: string;
  setNarratorStyle: (value: string) => void;
}

const genreOptions = [
  { value: "romance-contemporaine", label: "Romance contemporaine", emoji: "💑" },
  { value: "romance-historique", label: "Romance historique", emoji: "🏰" },
  { value: "fantasy-romance", label: "Fantasy romantique", emoji: "🧝" },
  { value: "romance-paranormale", label: "Romance paranormale", emoji: "🌙" },
  { value: "scifi-romance", label: "Romance sci-fi", emoji: "🚀" },
  { value: "romance-epistolaire", label: "Romance épistolaire", emoji: "✉️" },
  { value: "slow-burn", label: "Slow Burn", emoji: "🔥" },
  { value: "enemies-to-lovers", label: "Enemies to Lovers", emoji: "⚔️" },
  { value: "second-chance", label: "Seconde chance", emoji: "🔄" },
  { value: "conte-fees", label: "Conte de fées", emoji: "👑" },
];

const eraOptions = [
  { value: "antiquite", label: "Antiquité", emoji: "🏛️" },
  { value: "medieval", label: "Médiéval", emoji: "⚔️" },
  { value: "renaissance", label: "Renaissance", emoji: "🎨" },
  { value: "18e-siecle", label: "XVIIIe siècle", emoji: "👗" },
  { value: "19e-siecle", label: "XIXe siècle", emoji: "🎩" },
  { value: "belle-epoque", label: "Belle Époque", emoji: "🎭" },
  { value: "annees-folles", label: "Années folles", emoji: "💃" },
  { value: "mid-century", label: "Années 50-60", emoji: "🚗" },
  { value: "present", label: "Époque actuelle", emoji: "📱" },
  { value: "futur-proche", label: "Futur proche", emoji: "🌆" },
  { value: "futur-lointain", label: "Futur lointain", emoji: "🌌" },
  { value: "atemporel", label: "Atemporel", emoji: "✨" },
];

const writingStyleOptions = [
  { value: "immersif", label: "Immersif & descriptif" },
  { value: "cinematographique", label: "Cinématographique" },
  { value: "poetique", label: "Poétique & lyrique" },
  { value: "minimaliste", label: "Minimaliste" },
  { value: "dialogues", label: "Centré dialogues" },
  { value: "intimiste", label: "Intimiste" },
];

const povOptions = [
  { value: "first-hero", label: "1ère personne" },
  { value: "first-alternating", label: "1ère alternée" },
  { value: "third", label: "3ème omniscient" },
  { value: "third-limited", label: "3ème limité" },
  { value: "epistolary", label: "Épistolaire" },
];

const intensityOptions = [
  { value: "tender", label: "Tendre", emoji: "🌸" },
  { value: "moderate", label: "Équilibré", emoji: "💕" },
  { value: "passionate", label: "Passionné", emoji: "🔥" },
  { value: "steamy", label: "Sensuel", emoji: "💋" },
];

const toneOptions = [
  { value: "romantic", label: "Romantique" },
  { value: "tender", label: "Tendre" },
  { value: "passionate", label: "Passionné" },
  { value: "playful", label: "Espiègle" },
  { value: "poetic", label: "Poétique" },
];

const occasionOptions = [
  { value: "none", label: "Aucune occasion" },
  { value: "anniversaire", label: "Anniversaire" },
  { value: "saint-valentin", label: "Saint-Valentin" },
  { value: "mariage", label: "Mariage" },
  { value: "rencontre", label: "Première rencontre" },
  { value: "reconciliation", label: "Réconciliation" },
  { value: "declaration", label: "Déclaration" },
  { value: "quotidien", label: "Moment du quotidien" },
];

const voiceOptions = [
  { value: "female", label: "Voix féminine", emoji: "👩" },
  { value: "male", label: "Voix masculine", emoji: "👨" },
  { value: "neutral", label: "Voix neutre", emoji: "🎭" },
];

const narratorStyleOptions = [
  { value: "warm", label: "Chaleureux & intime" },
  { value: "dramatic", label: "Dramatique & théâtral" },
  { value: "soft", label: "Doux & apaisant" },
  { value: "passionate", label: "Passionné & intense" },
];

const StoryParametersPanel = ({
  genre,
  setGenre,
  era,
  setEra,
  writingStyle,
  setWritingStyle,
  pov,
  setPov,
  intensity,
  setIntensity,
  tone,
  setTone,
  occasion,
  setOccasion,
  enableAudio,
  setEnableAudio,
  voiceGender,
  setVoiceGender,
  narratorStyle,
  setNarratorStyle,
}: StoryParametersPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Genre & Era Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground mb-2 block">Genre littéraire</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {genreOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span>{option.emoji}</span>
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-foreground mb-2 block">Époque</Label>
          <Select value={era} onValueChange={setEra}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eraOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span>{option.emoji}</span>
                    <span>{option.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Style & POV Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground mb-2 block">Style d'écriture</Label>
          <Select value={writingStyle} onValueChange={setWritingStyle}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {writingStyleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-foreground mb-2 block">Point de vue</Label>
          <Select value={pov} onValueChange={setPov}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {povOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Intensity Selection */}
      <div>
        <Label className="text-foreground mb-3 block">Intensité romantique</Label>
        <div className="grid grid-cols-4 gap-2">
          {intensityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setIntensity(option.value)}
              className={`p-3 rounded-xl border transition-all text-center ${
                intensity === option.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/50 hover:border-primary/50 text-muted-foreground"
              }`}
            >
              <span className="text-lg block mb-1">{option.emoji}</span>
              <span className="text-xs font-medium block">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tone & Occasion Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground mb-2 block">Ton général</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="bg-background/50 border-border/50">
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
          <Label className="text-foreground mb-2 block">Occasion spéciale</Label>
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {occasionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audio Section */}
      <div className="border-t border-border/50 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Label className="text-foreground font-medium">Version audio</Label>
              <p className="text-xs text-muted-foreground">
                Générer une narration vocale de l'histoire
              </p>
            </div>
          </div>
          <Switch
            checked={enableAudio}
            onCheckedChange={setEnableAudio}
          />
        </div>

        {enableAudio && (
          <div className="grid md:grid-cols-2 gap-4 pl-13 animate-in slide-in-from-top-2">
            <div>
              <Label className="text-foreground mb-2 block text-sm">
                <Mic className="w-4 h-4 inline mr-1" />
                Type de voix
              </Label>
              <Select value={voiceGender} onValueChange={setVoiceGender}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm">
                Style de narration
              </Label>
              <Select value={narratorStyle} onValueChange={setNarratorStyle}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {narratorStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryParametersPanel;
