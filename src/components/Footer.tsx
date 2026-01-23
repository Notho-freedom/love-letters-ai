import { Heart, Mail, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-burgundy py-16 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <span className="font-display text-xl font-bold">LoveSpace</span>
            </div>
            <p className="font-serif mb-6 max-w-md text-primary-foreground/80">
              Exprimez votre amour avec des mots qui touchent le cœur. 
              Des messages personnalisés créés avec passion et technologie.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-primary-foreground/20"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display mb-4 text-lg font-semibold">Produit</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Fonctionnalités</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Tarifs</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Exemples</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-foreground">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-4 text-lg font-semibold">Support</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Centre d'aide</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Contact</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Confidentialité</a></li>
              <li><a href="#" className="transition-colors hover:text-primary-foreground">Conditions</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-sm text-primary-foreground/60">
            © 2026 LoveSpace. Fait avec <Heart className="inline h-4 w-4 fill-rose-medium text-rose-medium" /> pour les amoureux.
          </p>
          <p className="text-sm text-primary-foreground/60">
            Propulsé par l'amour et l'intelligence artificielle
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
