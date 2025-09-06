import Image from "next/image";

export default function ProductModal({ product, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative">
        <button className="absolute top-3 right-4 text-xl" onClick={onClose}>×</button>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className="object-contain rounded"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-red-500 font-semibold mb-4">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <button className="w-full bg-black text-white py-2 rounded">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
