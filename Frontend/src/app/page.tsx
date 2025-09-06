// src/app/page.tsx
import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import ServiceFeatures from "@/components/homepage/ServiceFeatures";
import Banner from "@/components/homepage/Banner";
import HeroSection from "@/components/homepage/HeroSection";
import HeroSection_2 from "@/components/homepage/HeroSection_2";
import FeaturedProducts from "@/components/products/FeaturedProducts";
import TileProductList from "@/components/products/TileProductList";

export default function HomePage() {
  return (
    <>
    <Banner />
    <ServiceFeatures />
    <HeroSection />
    <FeaturedProducts />
    <HeroSection_2 />
    <TileProductList />
    </>
  );
}
