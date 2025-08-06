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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    <nav className="border-b border-gray-200 shadow bg-white">
      {/* Logo et bouton menu */}
      <div className="flex items-center justify-between px-4 py-2">
        <div>
          <img src="/logo1.png" alt="Logo" className="h-12 w-auto" />
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 border rounded"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Menu déroulant */}
      {isMenuOpen && (
        <div className="flex flex-col items-center space-y-3 pb-6">
          <span className="text-lg">
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </span>

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

          <div className="text-center">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  )
}

// ✅ Composant NavItem stylé
function NavItem({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-full max-w-xs text-center px-6 py-3 rounded bg-[#aad7d4] hover:bg-[#3e878e] text-black font-semibold shadow border border-gray-300"
    >
      {label}
    </Link>
  )
}
