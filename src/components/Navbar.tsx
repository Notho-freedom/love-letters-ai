import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Créer", href: "#create" },
    { label: "Exemples", href: "#examples" },
    { label: "Tarifs", href: "#pricing" },
    { label: "À propos", href: "#about" },
  ];

  return (
    <motion.nav
      className="fixed left-0 right-0 top-0 z-50 glass-romantic"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-romantic shadow-romantic">
            <Heart className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Love<span className="text-rose-deep">Space</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-medium text-muted-foreground transition-colors hover:text-rose-deep"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost">Connexion</Button>
          <Button variant="romantic">Commencer</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          className="glass-romantic md:hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="py-2 font-medium text-foreground transition-colors hover:text-rose-deep"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full">
                Connexion
              </Button>
              <Button variant="romantic" className="w-full">
                Commencer
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
