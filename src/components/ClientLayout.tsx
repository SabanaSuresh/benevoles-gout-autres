"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "./Navbar"
import { useUser } from "@/lib/userStore"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()

  const publicRoutes = ["/login", "/signup", "/reset-password", "/update-password"]
  const isPublic = publicRoutes.some((p) => pathname?.startsWith(p))

  useEffect(() => {
    if (loading) return
    if (!user && !isPublic) {
      router.replace("/login")
    }
  }, [loading, user, isPublic, router])

  // Pages publiques : pas besoin d’être connecté
  if (isPublic) return <>{children}</>

  // Page privée : tant que l'user n'est pas confirmé, on affiche un vrai chargement
  if (loading) return <div className="p-4">Chargement...</div>

  // Si pas d'user → le useEffect redirige, on affiche rien
  if (!user) return null

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
