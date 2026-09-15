import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getJvTeam, isJvTeamSlug } from "@/lib/jv-teams"
import { JvSeasonDashboard } from "@/components/jv-season-dashboard"

type Props = { params: Promise<{ team: string }> }

export function generateStaticParams() { return [{ team: "red" }, { team: "white" }, { team: "black" }, { team: "gray" }] }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const teamSlug = (await params).team
  if (!isJvTeamSlug(teamSlug)) return { title: "JV team not found" }
  const team = getJvTeam(teamSlug)
  return { title: team ? `${team.stats.team} 2026` : "JV team not found" }
}

export default async function JvTeamPage({ params }: Props) {
  const teamSlug = (await params).team
  if (!isJvTeamSlug(teamSlug)) notFound()
  const bundle = getJvTeam(teamSlug)
  if (!bundle) notFound()
  return <JvSeasonDashboard stats={bundle.stats} />
}
