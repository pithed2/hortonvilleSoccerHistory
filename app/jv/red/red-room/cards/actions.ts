"use server"

import { revalidatePath } from "next/cache"
import { studioIdentity, validateCardDesign, checkReadyForSubmission, sendCardNotification } from "@/lib/card-studio-access"
import { createCard, getCard, playerCards, saveDraft, submitCard } from "@/lib/card-studio-store"
import type { CardDesign } from "@/lib/player-card-types"

async function identity() {
  const account = await studioIdentity()
  if (!account) throw new Error("Please sign in to the Red Room with your assigned account.")
  return account
}
function safeTitle(value: string) {
  const title = value.trim().slice(0,60)
  if (!title) throw new Error("Enter a card title.")
  return title
}
export async function listMyStudioCards() {
  const account = await identity()
  return { player: account.player, cards: await playerCards(account.accountId) }
}
export async function createMyStudioCard(title: string, input: CardDesign) {
  const account = await identity()
  const id = await createCard(account.accountId, safeTitle(title), validateCardDesign(input))
  revalidatePath("/jv/red/red-room/cards")
  return id
}
export async function updateMyStudioCard(id: string, title: string, input: CardDesign) {
  const account = await identity()
  await saveDraft(id, account.accountId, safeTitle(title), validateCardDesign(input))
  revalidatePath("/jv/red/red-room/cards")
}
export async function submitMyStudioCard(id: string) {
  const account = await identity()
  const card = await getCard(id)
  if (!card || card.ownerId !== account.accountId) throw new Error("Card not found or access denied.")
  checkReadyForSubmission(validateCardDesign(card.draft))
  const revision = await submitCard(id, account.accountId, account.player)
  await sendCardNotification(id, revision, account.player.name, card.title)
  revalidatePath("/jv/red/red-room/cards")
  return revision
}
