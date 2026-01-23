import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CreateSection from "@/components/CreateSection";
import ExamplesSection from "@/components/ExamplesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CreateSection />
      <ExamplesSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
