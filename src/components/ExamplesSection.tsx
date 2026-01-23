import { motion } from "framer-motion";
import { Heart, Quote, Volume2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const examples = [
  {
    type: "Poème",
    title: "À celle qui illumine mes jours",
    content: `Dans le jardin secret de mon cœur,
Tu as semé des roses de bonheur,
Chaque pétale porte ton doux nom,
Et chaque épine n'est qu'illusion.

Tes yeux sont des étoiles dans ma nuit,
Ton sourire, une mélodie qui me suit,
Je t'aime plus que les mots ne sauraient dire,
Tu es mon présent, mon avenir.`,
    author: "Pour Marie",
    style: "Romantique classique",
  },
  {
    type: "Lettre",
    title: "Mon amour éternel",
    content: `Ma chère âme sœur,

Si je devais compter toutes les raisons pour lesquelles je t'aime, 
je passerais l'éternité à écrire. Tu n'es pas seulement la personne 
que j'aime, tu es celle qui donne un sens à chacun de mes réveils.

Avec tout mon amour,
À jamais tien.`,
    author: "Pour Alexandre",
    style: "Tendre et sincère",
  },
  {
    type: "Message",
    title: "Bonne Saint-Valentin",
    content: `Chaque battement de mon cœur murmure ton prénom. 
En ce jour spécial, je voulais te rappeler que tu es 
la plus belle chose qui me soit arrivée. Je t'aime 
plus que les mots ne pourront jamais l'exprimer. 💕`,
    author: "Pour Sophie",
    style: "Doux et moderne",
  },
];

const ExamplesSection = () => {
  return (
    <section id="examples" className="bg-background py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-soft px-4 py-2 text-sm font-medium text-rose-dark">
            <Quote className="h-4 w-4" />
            Exemples
          </span>
          <h2 className="font-display mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Inspirez-vous de nos{" "}
            <span className="text-gradient-romantic">créations</span>
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Découvrez quelques exemples de messages générés par notre IA.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Header */}
              <div className="bg-gradient-romantic p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground">
                    {example.type}
                  </span>
                  <Heart className="h-5 w-5 text-primary-foreground opacity-80" />
                </div>
                <h3 className="font-display mt-4 text-xl font-semibold text-primary-foreground">
                  {example.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="relative mb-6">
                  <Quote className="absolute -left-1 -top-2 h-6 w-6 text-rose-medium opacity-30" />
                  <p className="font-serif whitespace-pre-line pl-4 text-foreground/90 leading-relaxed">
                    {example.content}
                  </p>
                </div>

                <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{example.author}</span>
                  <span className="rounded-full bg-rose-soft px-2 py-1 text-xs text-rose-dark">
                    {example.style}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Volume2 className="h-4 w-4" />
                    Écouter
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-medium/5 transition-transform duration-500 group-hover:scale-150" />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="romantic" size="lg">
            Créer le vôtre maintenant
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ExamplesSection;
