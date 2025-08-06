"use client"
import Link from "next/link"
import { useUser } from "@/lib/userStore"
import LogoutButton from "./LogoutButton"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Menu } from "lucide-react"

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
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo1.png" alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Bouton menu mobile */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm">
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </span>
          <NavLinks user={user} nbNotifs={nbNotifs} />
          <LogoutButton />
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3">
          <span className="text-sm">
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </span>
          <NavLinks user={user} nbNotifs={nbNotifs} />
          <LogoutButton />
        </div>
      )}
    </nav>
  )
}

function NavLinks({ user, nbNotifs }: { user: any; nbNotifs: number }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
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
  )
}

function NavItem({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-center px-4 py-2 rounded-lg bg-[#aad7d4] hover:bg-[#3e878e] text-black font-semibold shadow border border-gray-300"
    >
      {label}
    </Link>
  )
}
