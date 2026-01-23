import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Check, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const canceled = searchParams.get("canceled");

  if (canceled) {
    toast({
      title: "Paiement annulé",
      description: "Vous pouvez réessayer quand vous le souhaitez.",
    });
  }

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer le paiement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      description: "Parfait pour découvrir",
      features: [
        "3 créations par mois",
        "Génération IA basique",
        "Téléchargement texte",
        "Support communauté",
      ],
      limitations: [
        "Pas de conversion audio",
        "Pas d'envoi programmé",
        "Pas de galerie",
      ],
      cta: "Commencer gratuit",
      variant: "outline" as const,
      popular: false,
    },
    {
      name: "Premium",
      price: "9,99€",
      period: "/mois",
      description: "L'amour sans limites",
      features: [
        "Créations illimitées",
        "Génération IA avancée",
        "Conversion audio ElevenLabs",
        "Envoi programmé par email",
        "Partage dans la galerie",
        "Voix romantiques premium",
        "Support prioritaire",
        "Téléchargement audio MP3",
      ],
      limitations: [],
      cta: "Devenir Premium",
      variant: "romantic" as const,
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Tarification simple</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
            Choisissez votre formule
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Exprimez votre amour sans limites avec notre formule Premium
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card/50 backdrop-blur border rounded-3xl p-8 ${
                plan.popular
                  ? "border-primary shadow-2xl shadow-primary/20"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-2xl font-display text-foreground mb-2">
                  {plan.name}
                </h2>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation) => (
                  <li
                    key={limitation}
                    className="flex items-center gap-3 opacity-50"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">✕</span>
                    </div>
                    <span className="text-muted-foreground line-through">
                      {limitation}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={plan.popular ? handleSubscribe : () => navigate("/auth")}
                disabled={loading && plan.popular}
                variant={plan.variant}
                className={`w-full h-12 ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                    : ""
                }`}
              >
                {loading && plan.popular ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Redirection...
                  </>
                ) : (
                  <>
                    {plan.popular && <Crown className="w-5 h-5 mr-2" />}
                    {plan.cta}
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ / Trust elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Paiement sécurisé par Stripe • Annulation à tout moment
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-primary" />
              Satisfait ou remboursé
            </span>
            <span>•</span>
            <span>Sans engagement</span>
            <span>•</span>
            <span>Support 24/7</span>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
