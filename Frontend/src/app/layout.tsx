// src/app/layout.tsx
import './globals.css';
import type { Metadata } from "next";
import Headers from "@/components/homepage/Header";
import Footer from '@/components/homepage/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Hola Ecommerce",
  description: "Modern Sneaker Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="tc-new-price">
      <body className="font-sans bg-white text-black">
        <main className="min-h-screen">
          <Headers/>
          <Toaster position="top-right" />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}