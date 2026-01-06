import { Link } from "@tanstack/react-router";

export default function NotFoundPage() {
  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="mb-4 text-xl text-gray-600">Halaman tidak ditemukan</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Kembali ke Halaman Utama
      </Link>
    </div>
  );
}
