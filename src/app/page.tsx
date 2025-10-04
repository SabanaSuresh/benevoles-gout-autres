"use client"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center px-6 text-center font-sans">
      {/* ✅ Image optimisée */}
      <Image
        src="/logo.png"
        alt="Logo Le Goût des Autres"
        width={160}
        height={80}
        className="h-20 w-auto mb-6"
        priority
      />

      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-bold text-[#1e5363]">
          Bienvenue sur l’application du Goût des Autres
        </h1>

        <p className="text-[#141414]">
          Cette plateforme permet aux bénévoles du tiers-lieu de s’inscrire aux événements,
          et aux administrateurs de les organiser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            href="/login"
            className="bg-[#3e878e] hover:bg-[#f1887c] text-white font-medium py-2 px-4 rounded-md"
            style={{ width: "200px", textAlign: "center", margin: "0 auto" }}
          >
            Se connecter
          </Link>

          <Link
            href="/signup"
            className="bg-[#aad7d4] hover:bg-[#f9bd9b] text-black font-medium py-2 px-4 rounded-md"
            style={{ width: "200px", textAlign: "center", margin: "0 auto" }}
          >
            Créer un compte
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Site du tiers-lieu :{" "}
          <a
            href="https://legout-desautres.fr"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            legout-desautres.fr
          </a>
        </p>
      </div>
    </main>
  )
}
