import { redirect } from "next/navigation"

type Props = { params: Promise<{ gameId: string }> }

export default async function LegacyJvGamePage({ params }: Props) {
  redirect(`/jv/red/games/${(await params).gameId}`)
}
