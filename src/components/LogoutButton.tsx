"use client"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error("Erreur signOut:", e)
    } finally {
      // ✅ purge cache ancien et nouveau (au cas où)
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("user_info_v1")
          localStorage.removeItem("user_info_v2")
        } catch {}
      }
      router.replace("/login")
      router.refresh()
    }
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
