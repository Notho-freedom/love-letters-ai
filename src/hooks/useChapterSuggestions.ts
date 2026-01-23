// Smart chapter suggestions based on genre and era

interface ChapterSuggestion {
  title: string;
  description: string;
}

interface ChapterSuggestions {
  [key: string]: ChapterSuggestion[];
}

// Genre-based chapter structures
const genreChapters: ChapterSuggestions = {
  "romance-contemporaine": [
    { title: "La rencontre inattendue", description: "Premier regard, première étincelle" },
    { title: "Le rapprochement", description: "Moments partagés, complicité naissante" },
    { title: "Les doutes", description: "Obstacles et questionnements" },
    { title: "La révélation", description: "L'amour se déclare" },
    { title: "L'union des cœurs", description: "Épilogue romantique" },
  ],
  "romance-historique": [
    { title: "Le bal fatidique", description: "Première rencontre dans un monde de conventions" },
    { title: "Correspondance secrète", description: "Lettres et rendez-vous clandestins" },
    { title: "L'opposition familiale", description: "Obstacles sociaux et familiaux" },
    { title: "La fuite romanesque", description: "Choisir l'amour contre tout" },
    { title: "Le triomphe de l'amour", description: "Happy ending historique" },
  ],
  "fantasy-romance": [
    { title: "Le monde enchanté", description: "Introduction au royaume magique" },
    { title: "La prophétie", description: "Destins entrelacés par la magie" },
    { title: "L'épreuve magique", description: "Tests et sacrifices" },
    { title: "La bataille finale", description: "L'amour comme arme ultime" },
    { title: "Le nouveau royaume", description: "Épilogue féerique" },
  ],
  "romance-paranormale": [
    { title: "L'éveil surnaturel", description: "Découverte d'un monde caché" },
    { title: "L'attraction interdite", description: "Amour entre deux mondes" },
    { title: "Le secret révélé", description: "Vérités et transformations" },
    { title: "La traque", description: "Ennemis et protecteurs" },
    { title: "L'éternité ensemble", description: "Union au-delà du mortel" },
  ],
  "scifi-romance": [
    { title: "Premier contact", description: "Rencontre intergalactique" },
    { title: "Mondes parallèles", description: "Exploration et découverte mutuelle" },
    { title: "La mission", description: "L'amour face au devoir" },
    { title: "Transmission quantique", description: "Communication au-delà de l'espace" },
    { title: "Nouvelle frontière", description: "Avenir à construire ensemble" },
  ],
  "romance-epistolaire": [
    { title: "Première lettre", description: "Les mots comme premier pont" },
    { title: "L'attente du courrier", description: "Désir grandissant entre les lignes" },
    { title: "Les confessions", description: "Secrets partagés par écrit" },
    { title: "Le rendez-vous", description: "Quand les mots deviennent chair" },
    { title: "La dernière lettre", description: "Promesses éternelles" },
  ],
  "slow-burn": [
    { title: "Indifférence apparente", description: "Première impression trompeuse" },
    { title: "Moments volés", description: "Regards et frôlements" },
    { title: "L'amitié ambiguë", description: "Plus que des amis ?" },
    { title: "La tension insoutenable", description: "Le désir à son paroxysme" },
    { title: "L'embrasement", description: "Quand tout explose enfin" },
  ],
  "enemies-to-lovers": [
    { title: "La confrontation", description: "Première bataille, premiers éclairs" },
    { title: "L'alliance forcée", description: "Contraints de collaborer" },
    { title: "Derrière le masque", description: "Découvrir l'autre vraiment" },
    { title: "Le basculement", description: "De la haine à la passion" },
    { title: "L'amour conquis", description: "Unis contre vents et marées" },
  ],
  "second-chance": [
    { title: "Les retrouvailles", description: "Le passé resurface" },
    { title: "Les souvenirs", description: "Ce qui était, ce qui reste" },
    { title: "Les blessures", description: "Comprendre la séparation" },
    { title: "Le pardon", description: "Guérir ensemble" },
    { title: "Recommencer", description: "L'amour plus fort que jamais" },
  ],
  "conte-fees": [
    { title: "Il était une fois", description: "Prologue enchanteur" },
    { title: "Le sortilège", description: "L'obstacle magique" },
    { title: "La quête", description: "Prouver son amour" },
    { title: "Le baiser magique", description: "L'amour brise le sort" },
    { title: "Ils vécurent heureux", description: "Le happy ending éternel" },
  ],
};

// Era-specific modifiers
const eraModifiers: Record<string, { prefix?: string; setting?: string }> = {
  "antiquite": { prefix: "Sous les oliviers", setting: "temples et agoras" },
  "medieval": { prefix: "Au château", setting: "châteaux et forêts" },
  "renaissance": { prefix: "Dans les jardins", setting: "palais et ateliers" },
  "18e-siecle": { prefix: "Au salon", setting: "salons et jardins secrets" },
  "19e-siecle": { prefix: "Dans la brume", setting: "manoirs et landes" },
  "belle-epoque": { prefix: "Sous les lumières", setting: "cabarets et boulevards" },
  "annees-folles": { prefix: "Au speakeasy", setting: "jazz clubs et rooftops" },
  "mid-century": { prefix: "Sur la route", setting: "diners et drive-ins" },
  "present": { prefix: "En ville", setting: "cafés et appartements" },
  "futur-proche": { prefix: "Dans la mégapole", setting: "tours et réalité virtuelle" },
  "futur-lointain": { prefix: "À bord du vaisseau", setting: "stations spatiales" },
  "atemporel": { prefix: "Quelque part", setting: "lieux hors du temps" },
};

export function getChapterSuggestions(genre: string, era: string): ChapterSuggestion[] {
  const baseChapters = genreChapters[genre] || genreChapters["romance-contemporaine"];
  const modifier = eraModifiers[era];

  if (!modifier) return baseChapters;

  // Apply era modifiers to make suggestions more contextual
  return baseChapters.map((chapter, index) => ({
    ...chapter,
    description: index === 0 && modifier.setting
      ? `${chapter.description} (${modifier.setting})`
      : chapter.description,
  }));
}

export function getQuickChapterSets(genre: string): { name: string; chapters: string[] }[] {
  return [
    {
      name: "Court (3 chapitres)",
      chapters: ["Prologue", "Le cœur de l'histoire", "Épilogue"],
    },
    {
      name: "Classique (5 chapitres)",
      chapters: (genreChapters[genre] || genreChapters["romance-contemporaine"]).map(c => c.title),
    },
    {
      name: "Développé (7 chapitres)",
      chapters: [
        "Prologue",
        ...(genreChapters[genre] || genreChapters["romance-contemporaine"]).map(c => c.title),
        "Épilogue étendu",
      ],
    },
    {
      name: "Saga (10 chapitres)",
      chapters: [
        "Prologue",
        "Le monde avant toi",
        ...(genreChapters[genre] || genreChapters["romance-contemporaine"]).map(c => c.title),
        "Les épreuves",
        "La séparation",
        "Les retrouvailles",
        "Épilogue",
      ],
    },
  ];
}
