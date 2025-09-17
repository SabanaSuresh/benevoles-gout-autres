"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push("/evenements")
    }
  }

  return (
    <main className="min-h-screen bg-[--color-bg] flex flex-col items-center pt-16 px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold text-[#1e5363] mb-8 text-center">
          Connexion
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-6 flex flex-col items-center w-full"
        >
          {/* Champ email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aad7d4] text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Champ mot de passe avec icône œil */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aad7d4] text-lg pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1e5363] focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Message d'erreur */}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Bouton connexion */}
          <button
            type="submit"
            className="w-3/4 bg-[#3e878e] hover:bg-[#1e5363] text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
          >
            Se connecter
          </button>
        </form>

        {/* Liens secondaires */}
        <p className="text-sm text-center mt-6">
          Pas encore de compte ?{" "}
          <a
            href="/signup"
            className="text-[#1e5363] font-semibold hover:underline"
          >
            S’inscrire
          </a>
        </p>

        <p className="text-sm text-center mt-3">
          <a
            href="/reset-password"
            className="text-[#1e5363] font-semibold hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </p>
      </div>
    </main>
  )
}
