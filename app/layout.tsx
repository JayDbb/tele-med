import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Intellibus Telehealth",
  description: "Ready to help your patients today? Manage patient records, schedule visits, and track health progress.",
  icons: {
    icon: '/intellibus.jpeg',
    shortcut: '/intellibus.jpeg',
    apple: '/intellibus.jpeg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/intellibus.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/intellibus.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/intellibus.jpeg" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
      </head>
      <body className="page">
        {children}
      </body>
    </html>
  );
}

