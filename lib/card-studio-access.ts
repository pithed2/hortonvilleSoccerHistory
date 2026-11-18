import "server-only"
import { authenticatedPlayer } from "@/lib/red-room/auth"
import { cardProfileForAccount, cardSubjectsForAccount } from "@/lib/player-card-identity"
import { CARD_THEMES, type CardDesign, type CardPlayer } from "@/lib/player-card-types"
import { hasExifMetadata, stripJpegMetadata } from "@/lib/card-image-metadata"

export async function studioIdentity(): Promise<{ accountId: string; player: CardPlayer; subjects: CardPlayer[]; coach: boolean } | null> {
  const user = await authenticatedPlayer()
  if (!user || user.isBot || !["player", "coach"].includes(user.accountType)) return null
  const player = await cardProfileForAccount(user)
  if (!player) return null
  const subjects = await cardSubjectsForAccount(user, player)
  return { accountId: user.id, player, subjects, coach: user.accountType === "coach" }
}
export async function requireCoach() {
  const user = await authenticatedPlayer()
  if (!user || user.accountType !== "coach" || user.isBot) throw new Error("A Red Room coach login is required.")
  return user
}
const objectionable = [
  /\b(?:f[\W_]*u[\W_]*c[\W_]*k|f[\W_]*\*[\W_]*c[\W_]*k|motherfucker|sh[\W_]*[i1!][\W_]*t|b[\W_]*[i1!][\W_]*tch|c[\W_]*u[\W_]*n[\W_]*t)\b/i,
  /\b(?:n[i1!][g9]{2}[ae]r|f[a@]g(?:got)?|k[i1!]ke|retard(?:ed)?)\b/i,
  /\b(?:kill yourself|kys|rape|porn|nudes?)\b/i,
]
export function validatePlayerText(value: string) {
  const simplified = value.toLowerCase().replace(/[@]/g,"a").replace(/\$/g,"s").replace(/[0]/g,"o").replace(/\p{Cf}/gu,"")
  if (objectionable.some((pattern) => pattern.test(simplified))) throw new Error("Keep it PG-13. Remove inappropriate language.")
  return value
}
export function validateCardDesign(value: unknown): CardDesign {
  if (!value || typeof value !== "object") throw new Error("Invalid card.")
  const input = value as Record<string, unknown>
  const image = (photo: unknown) => {
    if (!photo || typeof photo !== "object") throw new Error("Invalid photo.")
    const p = photo as Record<string, unknown>
    if (typeof p.src !== "string" || p.src.length > 600000) throw new Error("Invalid or oversized photo.")
    let src: string = p.src
    if (src) {
      const match = /^data:image\/(jpeg|png|webp);base64,([a-zA-Z0-9+/=]+)$/.exec(src)
      if (!match) throw new Error("Only JPG, PNG and WebP images are accepted.")
      const bytes = Buffer.from(match[2], "base64")
      const valid = match[1] === "jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        : match[1] === "png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP"
      if (!valid) throw new Error("File content does not match its image type.")
      // Browser JPEGs may contain EXIF even after canvas conversion (notably on iOS).
      // Strip it before storage instead of rejecting an otherwise valid card.
      const cleaned = match[1] === "jpeg" ? stripJpegMetadata(bytes) : bytes
      if (hasExifMetadata(cleaned, match[1] as "jpeg" | "png" | "webp")) {
        throw new Error("This photo contains unsupported metadata. Re-upload it as a JPG.")
      }
      if (cleaned !== bytes) src = "data:image/" + match[1] + ";base64," + cleaned.toString("base64")
    }
    for (const field of ["x","y","zoom"]) if (typeof p[field] !== "number" || !Number.isFinite(p[field] as number)) throw new Error("Invalid image crop.")
    const x = p.x as number, y = p.y as number, zoom = p.zoom as number
    if (x < 0 || x > 100 || y < 0 || y > 100 || zoom < 1 || zoom > 2) throw new Error("Invalid image crop.")
    return { src, x, y, zoom, fit: p.fit === "contain" ? "contain" as const : "cover" as const }
  }
  if (input.subjectId !== undefined && (typeof input.subjectId !== "string" || !/^[a-z0-9-]{1,80}$/.test(input.subjectId))) throw new Error("Invalid card subject.")
  const subjectId = input.subjectId as string | undefined
  const overview = String(input.overview || "").trim()
  if (overview.length > 500 || overview.length < 0) throw new Error("Description must be 500 characters or less.")
  validatePlayerText(overview)
  if (!CARD_THEMES.includes(input.theme as CardDesign["theme"])) throw new Error("Invalid card finish.")
  const portrait = image(input.portrait), action = image(input.action)
  const highlight = input.highlight ? image(input.highlight) : undefined
  if (portrait.src.length + action.src.length + (highlight?.src.length || 0) > 1800000) throw new Error("Card photos exceed the storage limit.")
  return { portrait, action, ...(highlight ? { highlight } : {}), overview, theme: input.theme as CardDesign["theme"], rightsConfirmed: input.rightsConfirmed === true, ...(subjectId ? { subjectId } : {}) }
}
export function checkReadyForSubmission(design: CardDesign) {
  if (!design.portrait.src || !design.action.src || !design.overview || !design.rightsConfirmed) {
    throw new Error("Add two photos and a description, then confirm photo permission before submitting.")
  }
}
export async function sendCardNotification(id: string, revision: number, playerName: string, title: string) {
  const { updateNotification } = await import("@/lib/card-studio-store")
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CARD_APPROVAL_FROM_EMAIL
  if (!apiKey || !from) return // Keep queued until email is configured.
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL
    const url = base ? new URL("/coachs-corner/card-approvals", base).toString() : "/coachs-corner/card-approvals"
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "Idempotency-Key": id + ":" + revision },
      body: JSON.stringify({
        from, to: ["pithed2@gmail.com"], subject: "HHS Card Studio Approval Waiting",
        text: "A new player card is waiting for review.\nPlayer: " + playerName + "\nCard: " + title + "\nOpen the Coach Approval Dashboard: " + url,
      }),
    })
    if (!response.ok) throw new Error("Email provider returned HTTP " + response.status)
    await updateNotification(id,revision,"sent")
  } catch (error) {
    await updateNotification(id,revision,"failed",error instanceof Error ? error.message : "Email delivery failed")
  }
}
