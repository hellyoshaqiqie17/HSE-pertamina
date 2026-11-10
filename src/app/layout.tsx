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
    <html lang="en">
      <body className="font-sans antialiased">
        <EvoraProvider>
          <AppShell>{children}</AppShell>
        </EvoraProvider>
      </body>
    </html>
  );
}
