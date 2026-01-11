import {
  GradientBackground,
  Navbar,
  Hero,
  Features,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Animated Background */}
      <GradientBackground />

      {/* Content */}
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
        <Features />
        <Footer />
      </div>
    </main>
  );
}
