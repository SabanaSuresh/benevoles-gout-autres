"use client"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm bg-[#f1887c] hover:bg-[#e06f6a] text-white px-4 py-2 rounded font-medium transition"
    >
      Se déconnecter
    </button>
  )
}
