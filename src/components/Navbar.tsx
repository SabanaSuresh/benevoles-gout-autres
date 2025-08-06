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
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/logo1.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Menu icon on mobile */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Nom + déconnexion (desktop only) */}
        <div className="hidden md:flex items-center gap-4 text-sm text-black">
          <span>
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </span>
          <LogoutButton />
        </div>
      </div>

      {/* Liens */}
      <div className={`${menuOpen ? "block" : "hidden"} md:flex md:items-center md:justify-between mt-3 md:mt-0`}>
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-2 md:space-y-0">
          <NavItem href="/evenements" label="Événements" />
          <NavItem href="/calendrier" label="Calendrier" />
          {user.role === "admin" && <NavItem href="/admin/ajouter" label="Ajouter événement" />}
          {user.role === "admin" && <NavItem href="/admin/inscrits" label="Voir les inscrits" />}
          {user.role === "benevole" && <NavItem href="/mes-inscriptions" label="Mes inscriptions" />}
          <NavItem
            href="/notifications"
            label={
              <span className="relative inline-block">
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

        {/* Mobile-only: nom + bouton logout */}
        <div className="mt-4 md:hidden text-sm text-black flex flex-col gap-2">
          <span>
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </span>
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
      className="min-w-[160px] text-center px-4 py-2 rounded-md bg-[#aad7d4] hover:bg-[#3e878e] text-black font-semibold border border-gray-300"
    >
      {label}
    </Link>
  )
}
