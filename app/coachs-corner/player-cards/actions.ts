"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import { COACH_COOKIE, validCoachCookie } from "@/lib/coach-auth"
import { cardPlayers } from "@/lib/player-cards"
import { cardDraft, saveCard, withdrawCard } from "@/lib/player-card-store"
import type { CardDesign } from "@/lib/player-card-types"
import { exampleCardDesign } from "@/lib/player-card-examples"

const photo = z.object({ src: z.string().max(600_000).refine((value) => !value || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value), "Use a JPEG, PNG, or WebP photo."), x: z.number().min(0).max(100), y: z.number().min(0).max(100), zoom: z.number().min(1).max(2) })
const designSchema = z.object({ portrait: photo, action: photo, highlight: photo.optional(), overview: z.string().trim().max(500), theme: z.enum(["red", "black", "ice"]), rightsConfirmed: z.boolean() })
async function authorize(id: string) {
  if (!validCoachCookie((await cookies()).get(COACH_COOKIE)?.value)) throw new Error("Sign in to Coach’s Corner to manage cards.")
  const player = cardPlayers().find((entry) => entry.id === id)
  if (!player) throw new Error("Choose a player from the card roster.")
  return player
}
export async function loadCardDraft(id: string) {
  try {
    await authorize(id)
    const draft = await cardDraft(id)
    const example = !draft ? exampleCardDesign(id) : undefined
    return { draft: draft ?? (example ? { design: example, published: false, token: "" } : null) }
  } catch (error) { return { error: error instanceof Error ? error.message : "Could not load draft." } }
}
export async function savePlayerCard(id: string, input: CardDesign, publish: boolean) {
  try {
    const player = await authorize(id)
    const design = designSchema.parse(input)
    if (publish && (!design.portrait.src || !design.action.src || !design.overview || !design.rightsConfirmed)) return { error: "Add both photos and a player overview, then confirm permission to use the photos before saving a review copy." }
    const token = await saveCard(id, design, publish ? { player, design, publishedAt: new Date().toISOString() } : undefined)
    return { token, success: publish ? "Review copy saved. Coach sign-in is required to view this card." : "Draft saved. The review copy has not changed." }
  } catch (error) { return { error: error instanceof z.ZodError ? error.issues[0].message : error instanceof Error ? error.message : "Could not save the card. Please try again." } }
}
export async function unpublishPlayerCard(id: string) {
  try { await authorize(id); await withdrawCard(id); return { success: "Card removed from the gallery. Your draft is saved." } } catch (error) { return { error: error instanceof Error ? error.message : "Could not remove the card." } }
}
