import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import Banner from "@/components/homepage/Banner";

export default function HomePage() {
  const featured = [
    { name: "Nike Dunk Low", image: "/images/dunk.jpg", price: 150 },
    { name: "Adidas Forum", image: "/images/forum.jpg", price: 120 },
    { name: "New Balance 550", image: "/images/nb550.jpg", price: 130 },
    { name: "Yeezy Slide", image: "/images/yeezy.jpg", price: 90 },
  ];

  return (
    <>
      <Header />
      <main className="pt-24">
        <Banner />
        <section className="max-w-[1440px] mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p, i) => (
              <ProductCard slug={""} key={i} {...p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
