/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
      // Thêm các domain khác nếu cần
    ],
  },
};

module.exports = nextConfig;
