import { redirect } from "next/navigation"

// Player Cards stays inside Coach’s Corner until public release is approved.
export default function PlayerCardsPage() {
  redirect("/coachs-corner/player-cards")
}
