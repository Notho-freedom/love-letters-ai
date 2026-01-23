import { motion } from "framer-motion";
import { 
  Feather, 
  Calendar, 
  Send, 
  Volume2, 
  Edit3, 
  Sparkles,
  Heart,
  Mail
} from "lucide-react";

const features = [
  {
    icon: Feather,
    title: "Poèmes personnalisés",
    description: "L'IA crée des poèmes uniques basés sur votre histoire d'amour et la personnalité de votre partenaire.",
  },
  {
    icon: Edit3,
    title: "Édition intuitive",
    description: "Modifiez et peaufinez chaque mot pour que le message soit parfaitement adapté à vos sentiments.",
  },
  {
    icon: Calendar,
    title: "Programmation d'envoi",
    description: "Planifiez l'envoi de vos messages pour les moments spéciaux : anniversaires, Saint-Valentin...",
  },
  {
    icon: Send,
    title: "Envoi automatique",
    description: "Vos messages sont envoyés automatiquement par email ou SMS à la date et l'heure choisies.",
  },
  {
    icon: Volume2,
    title: "Version audio",
    description: "Convertissez vos textes en audio avec des voix naturelles pour une expérience encore plus intime.",
  },
  {
    icon: Sparkles,
    title: "Styles variés",
    description: "Choisissez parmi plus de 50 styles : romantique, poétique, humoristique, passionné...",
  },
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="features" className="bg-cream py-24">
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
            <Heart className="h-4 w-4 fill-current" />
            Fonctionnalités
          </span>
          <h2 className="font-display mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Tout pour exprimer votre{" "}
            <span className="text-gradient-romantic">amour</span>
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Des outils puissants et intuitifs pour créer des messages d'amour inoubliables.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative rounded-2xl bg-card p-8 shadow-soft transition-all duration-300 hover:shadow-card"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-romantic shadow-romantic transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display mb-3 text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="font-serif text-muted-foreground">
                {feature.description}
              </p>

              {/* Decorative Corner */}
              <div className="absolute right-4 top-4 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                <Mail className="h-20 w-20 text-rose-deep" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
