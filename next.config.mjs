/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Módulos nativos que no deben empaquetarse: se cargan directo en el server.
  serverExternalPackages: [
    "@napi-rs/canvas",
    "@imgly/background-removal-node",
    "onnxruntime-node",
    "sharp",
  ],
};

export default nextConfig;
