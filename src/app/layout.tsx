import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudGuard Security Suite",
  description: "Enterprise cloud security, simplified. Secure your AWS infrastructure with 25 audit phases and 340+ automated security checks.",
  keywords: ["AWS", "Security", "Audit", "Cloud Security", "Compliance", "CloudGuard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-white min-h-screen w-full m-0 p-0`}
      >
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(26, 10, 46, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
