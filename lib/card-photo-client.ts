import { cardImage } from "@/lib/render-player-card"

/** One photo conversion path for both the coach and player Card Studios. */
export async function prepareCardPhoto(file: File): Promise<string> {
  // HEIC/HEIF is decoded by supported browsers and then exported as JPEG.
  const supported = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]
  if (!supported.includes(file.type) || file.size > 20 * 1024 * 1024) {
    throw new Error("Choose a JPG, PNG, WebP or supported HEIC photo under 20 MB.")
  }
  const url = URL.createObjectURL(file)
  try {
    let image: HTMLImageElement
    try {
      image = await cardImage(url)
    } catch {
      throw new Error("Could not open this photo. Try a JPG or PNG copy.")
    }
    const canvas = document.createElement("canvas")
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("This browser cannot prepare photos.")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const src = canvas.toDataURL("image/jpeg", quality)
      if (src.startsWith("data:image/jpeg;base64,") && src.length < 600_000) {
        return src
      }
    }
    throw new Error("Photo is still too large after compression. Try a smaller image.")
  } finally {
    URL.revokeObjectURL(url)
  }
}
