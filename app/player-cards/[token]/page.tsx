import { redirect } from "next/navigation"

export default async function PersonalCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  redirect(`/coachs-corner/player-cards/${encodeURIComponent(token)}`)
}
