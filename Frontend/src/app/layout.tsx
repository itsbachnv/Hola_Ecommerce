// src/app/layout.tsx
import './globals.css';
import type { Metadata } from "next";
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import ToastContainer from '@/components/ui/ToastContainer';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import Script from 'next/script';

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
        <LoadingOverlay />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}