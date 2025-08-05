"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/userStore"

type Notif = {
  id: string
  message: string
  created_at: string
  vu: boolean
}

export default function NotificationsPage() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erreur chargement notifications :", error.message)
      } else {
        setNotifications(data || [])

        // ✅ Marquer comme vues les notifications non encore lues
        const nonVues = (data || []).filter((n) => !n.vu)
        if (nonVues.length > 0) {
          const ids = nonVues.map((n) => n.id)
          await supabase
            .from("notifications")
            .update({ vu: true })
            .in("id", ids)
        }
      }

      setLoading(false)
    }

    fetchNotifications()
  }, [user])

  if (loading) return <div className="p-4">Chargement...</div>

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-[#1e5363] mb-6">Mes notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">Aucune notification.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`rounded-xl border p-4 shadow-sm bg-white ${
                !notif.vu ? "border-[#f1887c] bg-[#f9bd9b]/30" : "border-[#d9f7f7]"
              }`}
            >
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
