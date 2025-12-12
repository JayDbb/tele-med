import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "TeleHealth MVP",
  description: "Clinician dashboard and visit workflow"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="page">
        <Header />
        {children}
      </body>
    </html>
  );
}

