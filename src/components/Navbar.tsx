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
    <nav className="bg-white border-b border-gray-200 shadow px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <img src="/logo1.png" alt="Logo" className="h-10 w-auto md:block hidden" />

        {/* Mobile menu toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 ml-auto">
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
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
          <span className="text-sm text-black">
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </span>
          <LogoutButton />
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-6 flex flex-col items-center text-center space-y-3">
          {/* Logo centré */}
          <img src="/logo1.png" alt="Logo" className="h-20 w-auto" />

          {/* Nom connecté centré */}
          <p className="text-black text-sm">
            Connecté : <strong>{user.prenom} {user.nom}</strong>
          </p>

          {/* Lien de navigation largeur complète */}
          <div className="flex flex-col items-center space-y-2 w-full px-6">
            <NavItemMobile href="/evenements" label="Événements" />
            <NavItemMobile href="/calendrier" label="Calendrier" />
            {user.role === "admin" && <NavItemMobile href="/admin/ajouter" label="Ajouter événement" />}
            {user.role === "admin" && <NavItemMobile href="/admin/inscrits" label="Voir les inscrits" />}
            {user.role === "benevole" && <NavItemMobile href="/mes-inscriptions" label="Mes inscriptions" />}
            <NavItemMobile href="/notifications" label="Notifications" />
          </div>

          {/* Déconnexion centrée */}
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  )
}

// ✅ Desktop link
function NavItem({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="min-w-[160px] text-center px-6 py-2 rounded-lg bg-[#aad7d4] hover:bg-[#3e878e] text-black font-semibold shadow border border-gray-300"
    >
      {label}
    </Link>
  )
}

// ✅ Mobile full-width link
function NavItemMobile({ href, label }: { href: string; label: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="w-full block text-center px-6 py-2 rounded-lg bg-[#aad7d4] hover:bg-[#3e878e] text-black font-semibold shadow border border-gray-300"
    >
      {label}
    </Link>
  )
}
