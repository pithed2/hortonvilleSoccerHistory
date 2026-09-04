import { permanentRedirect } from "next/navigation"

type Props = { params: Promise<{ gameId: string }> }

export default async function LegacyJvGamePage({ params }: Props) {
  permanentRedirect(`/jv/red/games/${(await params).gameId}`)
}
