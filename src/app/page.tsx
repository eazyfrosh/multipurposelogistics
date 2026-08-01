import { Hero } from "@/components/home/hero";
import { CarriersSection } from "@/components/home/carriers-section";
import { IllustrationsSection } from "@/components/home/illustrations-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { TestimonialsSection } from "@/components/home/testimonials-section";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CarriersSection />
      <IllustrationsSection />
      <FeaturesSection />
      <TestimonialsSection />
    </>
  );
}
