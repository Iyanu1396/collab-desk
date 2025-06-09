import type { Metadata } from "next";
import "./globals.css";
import { ToasterProvider } from "@/components/ToasterProvider";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "CollabDeck - Collaborative Knowledge Sharing Platform",
  description:
    "A miniature knowledge-sharing platform where multiple users can write, edit, and publish rich-text playbooks together in real-time. Real-time collaboration made simple.",
  keywords:
    "collaboration, knowledge sharing, real-time editing, playbooks, team productivity",
  authors: [{ name: "CollabDeck Team" }],
  creator: "CollabDeck",
  openGraph: {
    title: "CollabDeck - Collaborative Knowledge Sharing Platform",
    description:
      "Real-time collaborative editing platform for teams. Write, edit, and publish playbooks together.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollabDeck - Collaborative Knowledge Sharing Platform",
    description:
      "Real-time collaborative editing platform for teams. Write, edit, and publish playbooks together.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
          <ToasterProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
