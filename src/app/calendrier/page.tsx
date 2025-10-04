"use client"
import { useEffect, useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { supabase } from "@/lib/supabase"

type Event = {
  id: string
  titre: string
  date: string
}

export default function CalendrierPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      const todayLocal = new Date().toLocaleDateString("fr-CA")
      const { data, error } = await supabase
        .from("events")
        .select("id, titre, date")
        .gte("date", todayLocal) // ✅ masquer les dates passées
        .order("date", { ascending: true })

      if (!error && data) {
        setEvents(data)
      }
    }

    fetchEvents()
  }, [])

  const getEventsForDate = (date: Date) => {
    const formatted = date.toLocaleDateString("fr-CA")
    return events.filter((event) => event.date === formatted)
  }

  return (
    <main className="p-4 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-[#1e5363]">📅 Calendrier des événements</h1>

      <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
        <Calendar
          onClickDay={setSelectedDate}
          tileContent={({ date }) => {
            const e = getEventsForDate(date)
            return e.length > 0 ? (
              <div className="mt-1 text-xs text-[#3e878e] font-semibold">
                {e.length} 📍
              </div>
            ) : null
          }}
          className="w-full text-sm"
          tileClassName={({ date }) => {
            const match = getEventsForDate(date).length > 0
            return match ? "bg-[#f9bd9b]/40 rounded-md" : ""
          }}
        />
      </div>

      {selectedDate && (
        <div className="mt-8 bg-[#f7f7f7] rounded-xl p-4 shadow-inner">
          <h2 className="text-xl font-semibold mb-3 text-[#1e5363]">
            Événements le {selectedDate.toLocaleDateString("fr-FR")}
          </h2>
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">Aucun événement ce jour-là.</p>
          ) : (
            <ul className="list-disc list-inside text-[#141414]">
              {getEventsForDate(selectedDate).map((event) => (
                <li key={event.id} className="hover:underline cursor-pointer">
                  {event.titre}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  )
}
