"use client"
import Link from "next/link"
import { useUser } from "@/lib/userStore"
import LogoutButton from "./LogoutButton"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const { user, loading } = useUser()
  const [nbNotifs, setNbNotifs] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const fetchNotificationsCount = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("vu", false)

    if (!error) {
      setNbNotifs(data?.length || 0)
    }
  }

  useEffect(() => {
    fetchNotificationsCount()
    const interval = setInterval(fetchNotificationsCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (loading || !user) return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 shadow">
      <div className="flex items-center justify-between">
        <img src="/logo1.png" alt="Logo" className="h-12 w-auto" />

        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu déroulant mobile ou horizontal desktop */}
      <div
        className={`flex-col gap-2 mt-2 ${
          menuOpen ? "flex" : "hidden"
        } md:flex md:flex-row md:items-center md:justify-between`}
      >
        {/* Partie gauche : utilisateur */}
        <div className="text-sm text-black px-2 md:px-0">
          Connecté : <strong>{user.prenom} {user.nom}</strong>
        </div>

        {/* Liens de navigation */}
        <div className="flex flex-col md:flex-row gap-2 px-2 md:px-0">
          <NavItem href="/evenements" label="Événements" />
          <NavItem href="/calendrier" label="Calendrier" />
          {user.role === "admin" && <NavItem href="/admin/ajouter" label="Ajouter événement" />}
          {user.role === "admin" && <NavItem href="/admin/inscrits" label="Voir les inscrits" />}
          {user.role === "benevole" && <NavItem href="/mes-inscriptions" label="Mes inscriptions" />}
          <NavItem
            href="/notifications"
            label={
              <span className="relative">
                Notifications
                {nbNotifs > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {nbNotifs}
                  </span>
                )}
              </span>
            }
          />
        </div>

        {/* Bouton de déconnexion */}
        <div className="mt-2 md:mt-0 px-2 md:px-0">
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

function NavItem({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="min-w-[140px] text-center px-4 py-2 rounded-lg bg-[#aad7d4] hover:bg-[#3e878e] text-black font-semibold shadow border border-gray-300"
    >
      {label}
    </Link>
  )
}
