import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Heart, Sparkles, Crown } from "lucide-react";

const plans = [
  {
    name: "Étincelle",
    price: "0",
    description: "Parfait pour découvrir",
    icon: Heart,
    features: [
      "3 messages par mois",
      "Styles de base",
      "Envoi par email",
      "Édition simple",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Passion",
    price: "9",
    description: "Pour les romantiques",
    icon: Sparkles,
    features: [
      "Messages illimités",
      "Tous les styles",
      "Envoi email & SMS",
      "Programmation d'envoi",
      "Version audio basique",
      "Édition avancée",
    ],
    cta: "Choisir Passion",
    popular: true,
  },
  {
    name: "Éternel",
    price: "19",
    description: "L'amour sans limites",
    icon: Crown,
    features: [
      "Tout de Passion +",
      "Voix audio premium",
      "Styles personnalisés",
      "Support prioritaire",
      "Historique illimité",
      "Rappels automatiques",
    ],
    cta: "Choisir Éternel",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="bg-cream py-24">
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
            <Crown className="h-4 w-4" />
            Tarifs
          </span>
          <h2 className="font-display mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Investissez dans{" "}
            <span className="text-gradient-romantic">l'amour</span>
          </h2>
          <p className="font-serif text-lg text-muted-foreground">
            Des formules adaptées à toutes les histoires d'amour.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-3xl ${
                plan.popular
                  ? "bg-gradient-romantic p-[2px]"
                  : "bg-card shadow-soft"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div
                className={`h-full rounded-3xl p-8 ${
                  plan.popular ? "bg-card" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-gradient-romantic px-12 py-1 text-xs font-medium text-primary-foreground">
                    Populaire
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                    plan.popular
                      ? "bg-gradient-romantic shadow-romantic"
                      : "bg-rose-soft"
                  }`}
                >
                  <plan.icon
                    className={`h-6 w-6 ${
                      plan.popular ? "text-primary-foreground" : "text-rose-deep"
                    }`}
                  />
                </div>

                {/* Plan Info */}
                <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="font-display text-5xl font-bold">
                    {plan.price}€
                  </span>
                  <span className="text-muted-foreground">/mois</span>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-soft">
                        <Check className="h-3 w-3 text-rose-deep" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.popular ? "romantic" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
