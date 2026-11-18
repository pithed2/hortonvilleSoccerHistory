"use server"

import { revalidatePath } from "next/cache"
import { studioIdentity, validateCardDesign, validatePlayerText, checkReadyForSubmission, sendCardNotification } from "@/lib/card-studio-access"
import { createCard, deleteUnusedCard, getCard, playerCards, saveDraft, submitCard } from "@/lib/card-studio-store"
import type { CardDesign, CardPlayer } from "@/lib/player-card-types"

async function identity() {
  const account = await studioIdentity()
  if (!account) throw new Error("Please sign in to the Red Room with your assigned account.")
  return account
}
function safeTitle(value: string) {
  const title = value.trim().slice(0,60)
  if (!title) throw new Error("Enter a card title.")
  return validatePlayerText(title)
}
function safeDesign(input: CardDesign, subjects: CardPlayer[]): CardDesign {
  const design = validateCardDesign(input)
  const subjectId = design.subjectId ?? subjects[0]?.id
  if (!subjects.some((subject) => subject.id === subjectId)) throw new Error("This player profile is not available to your account.")
  return { ...design, subjectId }
}
export async function listMyStudioCards() {
  const account = await identity()
  return { player: account.player, cards: await playerCards(account.accountId) }
}
export async function createMyStudioCard(title: string, input: CardDesign) {
  const account = await identity()
  const id = await createCard(account.accountId, safeTitle(title), safeDesign(input, account.subjects))
  revalidatePath("/jv/red/red-room/cards")
  return id
}
export async function updateMyStudioCard(id: string, title: string, input: CardDesign) {
  const account = await identity()
  await saveDraft(id, account.accountId, safeTitle(title), safeDesign(input, account.subjects))
  revalidatePath("/jv/red/red-room/cards")
}
export async function submitMyStudioCard(id: string) {
  const account = await identity()
  const card = await getCard(id)
  if (!card || card.ownerId !== account.accountId) throw new Error("Card not found or access denied.")
  const design = safeDesign(card.draft, account.subjects)
  checkReadyForSubmission(design)
  const subject = account.subjects.find((entry) => entry.id === design.subjectId)
  if (!subject) throw new Error("This player profile is not available to your account.")
  const revision = await submitCard(id, account.accountId, subject)
  // The submission was committed above. Email is best-effort, so a provider
  // failure must not report the already-saved submission as failed.
  try {
    await sendCardNotification(id, revision, subject.name, card.title)
  } catch (error) {
    console.error("Card Studio submission saved; notification update failed.", error)
  }
  revalidatePath("/jv/red/red-room/cards")
  return revision
}

export async function deleteMyUnusedCard(id: string) {
  const account = await identity()
  await deleteUnusedCard(id, account.accountId)
  revalidatePath("/jv/red/red-room/cards")
}
