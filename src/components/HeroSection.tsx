import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Feather } from "lucide-react";
import heroImage from "@/assets/hero-romantic.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Romantic background"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute left-10 top-20 text-rose-medium opacity-60"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="h-8 w-8 fill-current" />
      </motion.div>
      <motion.div
        className="absolute right-20 top-40 text-gold opacity-50"
        animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Sparkles className="h-10 w-10" />
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-1/4 text-rose-deep opacity-40"
        animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Feather className="h-12 w-12" />
      </motion.div>

      {/* Main Content */}
      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-soft px-4 py-2 text-sm font-medium text-rose-dark">
            <Sparkles className="h-4 w-4" />
            L'art de déclarer son amour
          </span>
        </motion.div>

        <motion.h1
          className="font-display mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Exprimez votre amour avec des{" "}
          <span className="text-gradient-romantic">mots uniques</span>
        </motion.h1>

        <motion.p
          className="font-serif mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Créez des poèmes, lettres et messages d'amour personnalisés avec l'aide de l'IA.
          Programmez leur envoi et touchez le cœur de votre bien-aimé(e).
        </motion.p>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button variant="romantic" size="xl">
            <Heart className="h-5 w-5 fill-current" />
            Créer un message
          </Button>
          <Button variant="outline" size="xl">
            <Feather className="h-5 w-5" />
            Voir des exemples
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { value: "10K+", label: "Messages créés" },
            { value: "98%", label: "Satisfaction" },
            { value: "50+", label: "Styles uniques" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-display text-3xl font-bold text-rose-deep md:text-4xl">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
