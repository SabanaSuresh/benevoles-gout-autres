"use client"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#f7f7f7]">
      <h1 className="text-5xl font-bold text-[#f1887c] mb-4">404</h1>
      <h2 className="text-2xl text-[#1e5363] font-semibold mb-2">Oups ! Cette page n’existe pas.</h2>
      <p className="text-[#141414] mb-6">
        Il semblerait que l’adresse soit incorrecte ou que la page ait été déplacée.
      </p>

      <Link
        href="/"
        className="bg-[#3e878e] text-white px-6 py-2 rounded-lg hover:bg-[#1e5363]"
      >
        Revenir à l’accueil
      </Link>
    </main>
  )
}
