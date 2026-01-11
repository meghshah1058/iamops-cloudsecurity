import { GradientBackground } from "@/components/landing";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GradientBackground />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
