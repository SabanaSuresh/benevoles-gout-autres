"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
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

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: form.password,
      options: { data: { prenom: form.prenom, nom: form.nom, role: "benevole" } },
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    if (data.session && data.user) {
      const { error: userError } = await supabase.from("users").upsert({
        id: data.user.id,
        prenom: form.prenom,
        nom: form.nom,
        role: "benevole",
        email: normalizedEmail,
      })
      if (userError) {
        setErrorMsg("Erreur mise à jour profil : " + userError.message)
        setLoading(false)
        return
      }
      alert("Inscription réussie, tu peux te connecter maintenant.")
      router.push("/login")
    } else {
      alert("Inscription réussie. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.")
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

        <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="prenom" className="text-sm font-medium">Prénom</label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              placeholder="Prénom"
              value={form.prenom}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
              required
              autoComplete="given-name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="nom" className="text-sm font-medium">Nom</label>
            <input
              id="nom"
              name="nom"
              type="text"
              placeholder="Nom"
              value={form.nom}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
              required
              autoComplete="family-name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nom@domaine.fr"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
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
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 pr-12 rounded focus:outline-none focus:ring-2 focus:ring-[#aad7d4]"
                required
                autoComplete="new-password"
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

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#aad7d4] hover:bg-[#3e878e] disabled:opacity-60 text-black font-semibold py-2 rounded transition"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
      </div>
    </main>
  )
}
