
import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider, ToastViewport } from "@topdeal/ui";
import "./globals.css";

const schibstedGrotesk = Schibsted_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-schibsted-grotesk",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "TopDeal",
    template: "%s | TopDeal",
  },
  description: "La marketplace de proximité à Bafoussam.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${schibstedGrotesk.variable} h-full antialiased`}
    >
      <body className={`${schibstedGrotesk.className} min-h-full flex flex-col`}>
        <ThemeProvider>
          {children}
          <ToastViewport />
        </ThemeProvider>
      </body>
    </html>
  );
}
