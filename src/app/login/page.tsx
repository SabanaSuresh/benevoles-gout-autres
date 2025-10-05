"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  // Taille et hauteur forcées (prioritaires sur tout CSS global)
  const FIELD_HEIGHT_PX = 50
  const FIELD_FONT_PX = 22
  const BUTTON_FONT_PX = 22

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    router.push("/evenements")
  }

  return (
    <main className="min-h-screen bg-[--color-bg] flex flex-col items-center pt-16 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-xl">
        <h1 className="text-4xl font-bold text-[#1e5363] mb-10 text-center">
          Connexion
        </h1>

        {/* Styles locaux pour les placeholders agrandis */}
        <style jsx>{`
          .bigInput::placeholder {
            font-size: ${FIELD_FONT_PX}px;
          }
        `}</style>

        <form onSubmit={handleLogin} autoComplete="on" className="space-y-8 w-full">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium" style={{ fontSize: 18 }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nom@domaine.fr"
              className="bigInput w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#aad7d4] px-5"
              style={{ height: FIELD_HEIGHT_PX, fontSize: FIELD_FONT_PX }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username email"
            />
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium" style={{ fontSize: 18 }}>
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="bigInput w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#aad7d4] pr-12 pl-5"
                style={{ height: FIELD_HEIGHT_PX, fontSize: FIELD_FONT_PX }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 my-auto p-2 rounded hover:bg-gray-100"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPassword}
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Bouton */}
          <button
            type="submit"
            className="w-full bg-[#3e878e] hover:bg-[#1e5363] text-white font-semibold rounded-lg transition"
            style={{ height: FIELD_HEIGHT_PX, fontSize: BUTTON_FONT_PX }}
          >
            Se connecter
          </button>
        </form>

        <p className="text-base text-center mt-8">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-[#1e5363] font-semibold hover:underline">
            S’inscrire
          </a>
        </p>

        <p className="text-base text-center mt-4">
          <a href="/reset-password" className="text-[#1e5363] font-semibold hover:underline">
            Mot de passe oublié ?
          </a>
        </p>
      </div>
    </main>
  )
}
