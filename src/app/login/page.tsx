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

        <form onSubmit={handleLogin} autoComplete="on" className="space-y-8 w-full">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nom@domaine.fr"
              className="w-full border border-gray-300 px-5 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aad7d4] text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full border border-gray-300 px-5 py-4 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aad7d4] text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 my-auto p-1 rounded hover:bg-gray-100"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                aria-pressed={showPassword}
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#3e878e] hover:bg-[#1e5363] text-white font-semibold py-4 rounded-lg text-lg transition"
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
