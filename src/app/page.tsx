import { Hero } from "@/components/home/hero";
import { CarriersSection } from "@/components/home/carriers-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FaqSection } from "@/components/home/faq-section";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CarriersSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
