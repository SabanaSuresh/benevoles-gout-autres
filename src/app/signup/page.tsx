"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const normalizedEmail = form.email.trim().toLowerCase()

    // (optionnel) validations rapides côté client
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setErrorMsg("Merci d’entrer un email valide.")
      setLoading(false)
      return
    }
    if (form.password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.")
      setLoading(false)
      return
    }

    // 1) Création du compte Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: form.password,
      // Vous pouvez ajouter emailRedirectTo si vous utilisez la confirmation d’email
      // options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    // 2) Upsert du profil app dans public.users (→ AJOUT DE email)
    if (data.user) {
      const { error: userError } = await supabase
        .from("users")
        .upsert({
          id: data.user.id,
          prenom: form.prenom,
          nom: form.nom,
          role: "benevole",
          email: normalizedEmail, // ✅ corrige le NULL dans public.users
        })

      if (userError) {
        setErrorMsg("Erreur mise à jour profil : " + userError.message)
        setLoading(false)
        return
      }
    }

    // 3) Message en fonction de la confirmation d’email
    // Si la confirmation est activée sur Supabase, data.session peut être null.
    if (!data.session) {
      alert(
        "Inscription réussie. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter."
      )
      router.push("/login")
    } else {
      alert("Inscription réussie, tu peux te connecter maintenant.")
      router.push("/login")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[--color-bg] flex flex-col items-center pt-10 px-4">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#1e5363] mb-6 text-center">
          Créer un compte
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={form.prenom}
            onChange={handleChange}
            style={{ width: "384px" }}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
            required
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={form.nom}
            onChange={handleChange}
            style={{ width: "384px" }}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={{ width: "384px" }}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            style={{ width: "384px" }}
            className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
            required
          />

          {errorMsg && (
            <p className="text-red-600 text-sm self-start" style={{ width: "384px" }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "288px" }}
            className="bg-[#aad7d4] hover:bg-[#3e878e] disabled:opacity-60 text-black font-semibold py-2 rounded transition"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
      </div>
    </main>
  )
}
