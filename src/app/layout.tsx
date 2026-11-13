import type { Metadata } from "next";
import "./globals.css";
import { EvoraProvider } from "@/lib/evora-context";
import { AppShell } from "@/components/app-shell/app-shell";

export const metadata: Metadata = {
  title: "EVORA | Adaptive Emergency Evacuation Decision-Support Prototype",
  description:
    "Interactive R&D web prototype for EVORA: IoT, Digital Twin, and Hybrid Multi-Agent Simulation for adaptive evacuation in downstream energy storage depots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#FAFBFC] text-[#0F172A] selection:bg-[#EEF2FF] selection:text-[#4B6BFB]">
        <EvoraProvider>
          <AppShell>{children}</AppShell>
        </EvoraProvider>
      </body>
    </html>
  );
}
