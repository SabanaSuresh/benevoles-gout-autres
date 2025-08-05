"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

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
    <main className="min-h-screen bg-[--color-bg] flex flex-col items-center pt-10 px-4">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#1e5363] mb-6 text-center">Connexion</h1>

        <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
          <input
            type="email"
            placeholder="Email"
            style={{ width: "384px" }}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            style={{ width: "384px" }}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            style={{ width: "288px" }}
            className="bg-[#3e878e] hover:bg-[#1e5363] text-white font-semibold py-2 px-6 rounded transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-[#1e5363] font-semibold hover:underline">
            S’inscrire
          </a>
        </p>
      </div>
    </main>
  )
}
