// src/app/layout.tsx
import './globals.css';
import type { Metadata } from "next";
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: "Hola Ecommerce",
  description: "Modern Sneaker Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="tc-new-price">
      <body className="font-sans bg-white text-black">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}