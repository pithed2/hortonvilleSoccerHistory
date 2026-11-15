"use server"
import { revalidatePath } from "next/cache"
import { requireCoach } from "@/lib/card-studio-access"
import { decideCard, withdrawCard } from "@/lib/card-studio-store"
export async function decideSubmission(id:string,revision:number,decision:"approved"|"rejected",reason:string) {
  const coach=await requireCoach()
  await decideCard(id,revision,coach.id,decision,reason.trim().slice(0,400))
  revalidatePath("/coachs-corner/card-approvals")
  revalidatePath("/jv/red/red-room/cards")
}

export async function withdrawApproval(id:string) {
  const coach=await requireCoach()
  await withdrawCard(id,coach.id)
  revalidatePath("/coachs-corner/card-approvals")
}
