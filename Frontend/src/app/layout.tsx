// src/app/layout.tsx
import './globals.css';
import type { Metadata } from "next";
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import ToastContainer from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: "Hola Ecommerce",
  description: "Modern Sneaker Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="tc-new-price">
      <body className="font-sans text-black min-h-screen" style={{ backgroundColor: '#fcfaf2' }}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <ToastContainer />
      </body>
    </html>
  );
}