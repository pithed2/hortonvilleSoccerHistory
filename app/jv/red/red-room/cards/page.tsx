import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { studioIdentity } from "@/lib/card-studio-access"
import { MyCardStudio } from "./my-card-studio"
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "My Player Card Studio", robots: { index: false, follow: false, noimageindex: true } }
export default async function CardStudioPage() {
  const identity = await studioIdentity()
  if (!identity) redirect("/jv/red/red-room")
  return <main className="min-h-screen bg-[#090a0e] px-4 py-8 text-white sm:px-8"><MyCardStudio player={identity.player}/></main>
}