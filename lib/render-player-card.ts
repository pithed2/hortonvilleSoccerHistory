import type { CardDesign, CardPhoto, CardPlayer } from "./player-card-types"

export const CARD_WIDTH = 1000
export const CARD_HEIGHT = 1400
let iceTexture: HTMLCanvasElement | undefined

// Build one repeatable foil texture per browser session and reuse it for every
// preview/export. The transparent center keeps faces and photo details clear.
function crackedIceTexture() {
  if (iceTexture) return iceTexture
  const texture = document.createElement("canvas")
  texture.width = CARD_WIDTH; texture.height = CARD_HEIGHT
  const ctx = texture.getContext("2d")!
  let seed = 2026
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  const columns = 7, rows = 10
  const points = Array.from({ length: rows + 1 }, (_, row) => Array.from({ length: columns + 1 }, (_, column) => ({
    x: column * CARD_WIDTH / columns + (column > 0 && column < columns ? (random() - .5) * 110 : 0),
    y: row * CARD_HEIGHT / rows + (row > 0 && row < rows ? (random() - .5) * 110 : 0),
  })))
  function facet(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
    const red = random() < .16
    const gradient = ctx.createLinearGradient(a.x, a.y, c.x + 35, c.y + 45)
    gradient.addColorStop(0, red ? "#E4002B" : "#F4F7FA")
    gradient.addColorStop(.32, red ? "#FFE0E5" : "#9DABB9")
    gradient.addColorStop(.48, "#FFFFFF")
    gradient.addColorStop(.56, red ? "#7C1025" : "#455361")
    gradient.addColorStop(1, "#CDD6DF")
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath()
    ctx.fillStyle = gradient; ctx.fill()
    ctx.strokeStyle = "rgba(0,0,0,.65)"; ctx.lineWidth = 3; ctx.stroke()
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = .8; ctx.stroke()
  }
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const a = points[row][column], b = points[row][column + 1], c = points[row + 1][column], d = points[row + 1][column + 1]
    if (random() > .5) { facet(a, b, c); facet(b, d, c) }
    else { facet(a, b, d); facet(a, d, c) }
  }
  ctx.globalCompositeOperation = "destination-in"
  const mask = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0)
  mask.addColorStop(0, "rgba(0,0,0,.92)"); mask.addColorStop(.16, "rgba(0,0,0,.35)")
  mask.addColorStop(.32, "rgba(0,0,0,.035)"); mask.addColorStop(.68, "rgba(0,0,0,.035)")
  mask.addColorStop(.84, "rgba(0,0,0,.35)"); mask.addColorStop(1, "rgba(0,0,0,.92)")
  ctx.fillStyle = mask; ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  iceTexture = texture
  return texture
}
export async function cardImage(src: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.src = src
  await image.decode()
  return image
}

export async function renderPlayerCard(canvas: HTMLCanvasElement, player: CardPlayer, design: CardDesign, side: "front" | "back") {
  // Reuse next/font's self-hosted Poppins family, including its generated name.
  const family = getComputedStyle(document.body).getPropertyValue("--font-poppins").trim() || "Arial, sans-serif"
  await Promise.all([400, 700, 800].map((weight) => document.fonts.load(`${weight} 28px ${family}`)))
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext("2d")!
  const [portrait, action, logo, highlight] = await Promise.all([design.portrait.src ? cardImage(design.portrait.src) : null, design.action.src ? cardImage(design.action.src) : null, cardImage("/logos/modern-bear-logo-white-fill.png"), design.highlight?.src ? cardImage(design.highlight.src) : null])
  const cooperBack = player.id === "cooper-re-coach" && side === "back"
  const [kimberly, whitewater] = await Promise.all([
    cooperBack ? cardImage("/logos/cooper-kimberly.png") : null,
    cooperBack ? cardImage("/logos/cooper-uww-transparent.png") : null,
  ])
  const isIce = design.theme === "ice"
  const accent = design.theme === "black" || isIce ? "#FFFFFF" : "#E4002B"
  function text(value: string, x: number, y: number, size: number, color = "#fff", weight = 800, maxWidth?: number) {
    ctx.fillStyle = color
    ctx.font = `${Math.min(weight, 800)} ${size}px ${family}`
    if (maxWidth) while (ctx.measureText(value).width > maxWidth && size > 10) { size--; ctx.font = `${Math.min(weight, 800)} ${size}px ${family}` }
    ctx.fillText(value, x, y)
  }
  function photo(image: HTMLImageElement | null, crop: CardPhoto, x: number, y: number, w: number, h: number) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
    if (image) {
      const scale = (crop.fit === "contain" ? Math.min : Math.max)(w / image.naturalWidth, h / image.naturalHeight) * crop.zoom
      const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale
      ctx.drawImage(image, x - (dw - w) * crop.x / 100, y - (dh - h) * crop.y / 100, dw, dh)
    } else {
      const gradient = ctx.createLinearGradient(x, y, x + w, y + h); gradient.addColorStop(0, "#9D9D9D"); gradient.addColorStop(1, "#000000")
      ctx.fillStyle = gradient; ctx.fillRect(x, y, w, h)
      ctx.fillStyle = "#ffffff10"; ctx.beginPath(); ctx.arc(x + w / 2, y + h * .35, w * .13, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .8, w * .3, h * .3, 0, 0, Math.PI * 2); ctx.fill()
      text("PHOTO TO COME", x + 30, y + h - 40, 22, "#ffffff70")
    }
    ctx.restore()
  }
  // A faint diagonal sheen band cut into the accent gradient reads as foil under light,
  // rather than a flat color — the same trick real foil/parallel cards use.
  const sheen = design.theme === "black" ? "rgba(0,0,0,.4)" : "rgba(255,255,255,.6)"
  function foilGradient(x0: number, y0: number, x1: number, y1: number) {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
    if (isIce) {
      gradient.addColorStop(0, "#73808D"); gradient.addColorStop(.2, "#FFFFFF")
      gradient.addColorStop(.4, "#A5B2BF"); gradient.addColorStop(.52, "#E4002B")
      gradient.addColorStop(.6, "#FFFFFF"); gradient.addColorStop(1, "#73808D")
      return gradient
    }
    gradient.addColorStop(0, accent); gradient.addColorStop(.22, sheen); gradient.addColorStop(.36, accent)
    gradient.addColorStop(.58, sheen); gradient.addColorStop(.74, accent); gradient.addColorStop(1, accent)
    return gradient
  }
  function stripe(y: number) {
    ctx.fillStyle = foilGradient(0, y - 140, 1000, y + 180)
    ctx.beginPath(); ctx.moveTo(0, y + 110); ctx.lineTo(1000, y - 140); ctx.lineTo(1000, y - 70); ctx.lineTo(0, y + 180); ctx.fill()
  }
  // A giant translucent jersey number behind the lower, already-shaded part of the
  // photo — a staple of trading-card design that gives the layout more presence.
  function numberWatermark(x: number, y: number, size: number, align: CanvasTextAlign) {
    ctx.save(); ctx.globalAlpha = .13; ctx.textAlign = align
    ctx.font = `900 ${size}px ${family}`; ctx.fillStyle = "#fff"
    ctx.fillText(`${player.number}`, x, y)
    ctx.textAlign = "left"; ctx.restore()
  }
  // A small embossed gold stamp: a dark drop-shadow pass and a light highlight pass
  // offset in opposite directions under a gold-gradient fill simulate a pressed seal.
  function limitedEditionStamp(x: number, y: number, rotation: number) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation)
    const gold = ctx.createLinearGradient(0, -34, 0, 34)
    gold.addColorStop(0, "#FCE98A"); gold.addColorStop(.5, "#D4AF37"); gold.addColorStop(1, "#8A6A14")
    ctx.strokeStyle = gold; ctx.lineWidth = 2.5
    ctx.strokeRect(-130, -34, 260, 68); ctx.strokeRect(-122, -27, 244, 54)
    ctx.textAlign = "center"
    function emboss(value: string, ty: number, size: number) {
      ctx.font = `900 ${size}px ${family}`
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillText(value, 1.5, ty + 1.5)
      ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillText(value, -1.5, ty - 1.5)
      ctx.fillStyle = gold; ctx.fillText(value, 0, ty)
    }
    emboss("LIMITED EDITION", -6, 19)
    emboss("1 OF 1", 20, 25)
    ctx.textAlign = "left"; ctx.restore()
  }
  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  if (side === "front") {
    photo(portrait, design.portrait, 0, 0, 1000, 1140)
    if (isIce) ctx.drawImage(crackedIceTexture(), 0, 0, 1000, 1140, 0, 0, 1000, 1140)
    const shade = ctx.createLinearGradient(0, 600, 0, 1250); shade.addColorStop(0, "#00000000"); shade.addColorStop(1, "#000000")
    ctx.fillStyle = shade; ctx.fillRect(0, 600, 1000, 650)
    numberWatermark(970, 1120, 560, "right")
    stripe(900)
    if (action) {
      const insetW = player.coach ? 270 : 340, insetH = player.coach ? 340 : 240
      ctx.save(); ctx.translate(player.coach ? 680 : 610, player.coach ? 720 : 800); ctx.rotate(.055); ctx.fillStyle = accent; ctx.fillRect(-7, -7, insetW + 14, insetH + 14)
      photo(action, design.action, 0, 0, insetW, insetH); ctx.restore()
    }
    limitedEditionStamp(822, 1098, -.08)
    ctx.fillStyle = "#000000d9"; ctx.fillRect(0, 0, 1000, 145)
    ctx.drawImage(logo, 42, 25, 90, 90)
    text("HORTONVILLE", 160, 65, 38); text("POLAR BEARS / BOYS SOCCER", 160, 102, 20, "#FFFFFF")
    if (player.number) text(`#${player.number}`, 765, 100, 70, accent, 900, 190)
    text(player.coach ? "COACH COLLECTION / TESTER EDITION" : player.example ? "OG ANDY / EXAMPLE EDITION" : player.season === 2026 ? "2026 FOX VALLEY ASSOCIATION CHAMPIONS" : "ALUMNI EDITION", 55, 1140, 25, accent, 800, 890)
    const parts = player.name.split(" "), last = parts.pop() ?? "", first = parts.join(" ")
    text(first.toUpperCase(), 55, 1197, 44, "#fff", 700, 885)
    text(last.toUpperCase(), 50, 1284, 88, "#fff", 900, 900)
    text(player.coach ? `${player.position.toUpperCase()}  /  ${player.season}` : player.example ? `#${player.number}  /  THROWBACK COLLECTION` : [player.position, player.classYear, player.season].filter(Boolean).join("  /  "), 55, 1341, 25, "#FFFFFF")
  } else {
    photo(highlight ?? action, highlight && design.highlight ? design.highlight : design.action, 0, player.coach ? 95 : 0, 1000, player.coach ? 450 : 650)
    if (isIce) {
      ctx.drawImage(crackedIceTexture(), 0, 0)
      ctx.fillStyle = "rgba(0,0,0,.94)"; ctx.fillRect(50, 650, 900, 738)
      ctx.fillStyle = "rgba(0,0,0,.75)"; ctx.fillRect(40, 25, 700, 65)
    }
    const shadeTop = player.coach ? 550 : 350
    const shade = ctx.createLinearGradient(0, shadeTop, 0, 650); shade.addColorStop(0, "#00000000"); shade.addColorStop(1, "#000000")
    ctx.fillStyle = shade; ctx.fillRect(0, shadeTop, 1000, 650 - shadeTop)
    numberWatermark(955, 985, 420, "right")
    text([player.position, player.number ? `#${player.number}` : ""].filter(Boolean).join("  /  "), 55, 70, 30)
    text(player.name.toUpperCase(), 50, 620, 58, "#fff", 900, 900)
    ctx.fillStyle = foilGradient(50, 650, 950, 660); ctx.fillRect(50, 655, 900, 5)
    text(player.statsTitle ?? (player.coach ? `UW–WHITEWATER CAREER / ${player.careerSpan}` : player.example ? "PLAYER SNAPSHOT / EXAMPLE EDITION" : `VARSITY CAREER / ${player.careerSpan}`), 55, 700, 22, accent)
    // Stat table: a bordered scoreboard grid — header bar, two distinct rows, and
    // ruled column/row dividers — rather than text floating on the bare background.
    const tableX = 50, tableW = 900, labelW = 230, headerH = 62, rowH = 74, tableTop = 730
    const statColsX = tableX + labelW, statColsW = tableW - labelW
    const seasonY = tableTop + headerH, careerY = seasonY + rowH, tableBottom = careerY + rowH
    const positions = player.metrics.map((_, i) => statColsX + statColsW * (i + .5) / player.metrics.length)
    ctx.fillStyle = "#000000"; ctx.fillRect(tableX, tableTop, tableW, headerH)
    text(player.statsRowLabels ? "SCHOOL" : "SEASON", tableX + 22, tableTop + 40, 22)
    player.metrics.forEach((metric, i) => { ctx.textAlign = "center"; text(metric.label, positions[i], tableTop + 40, 22) }); ctx.textAlign = "left"
    ctx.fillStyle = design.theme === "black" || isIce ? "rgba(255,255,255,.1)" : "rgba(228,0,43,.16)"; ctx.fillRect(tableX, seasonY, tableW, rowH)
    text(player.statsRowLabels?.[0] ?? (player.coach ? String(player.statsSeason ?? player.season) : player.example ? "EXAMPLE" : String(player.season)), tableX + 22, seasonY + 47, 28, accent, 800)
    player.metrics.forEach((metric, i) => { ctx.textAlign = "center"; text(metric.season, positions[i], seasonY + 47, 32) }); ctx.textAlign = "left"
    ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.fillRect(tableX, careerY, tableW, rowH)
    text(player.statsRowLabels?.[1] ?? "CAREER", tableX + 22, careerY + 47, 28, "#fff", 800)
    player.metrics.forEach((metric, i) => { ctx.textAlign = "center"; text(metric.career, positions[i], careerY + 47, 32) }); ctx.textAlign = "left"
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 2
    ctx.strokeRect(tableX, tableTop, tableW, tableBottom - tableTop)
    ctx.beginPath()
    ctx.moveTo(tableX, seasonY); ctx.lineTo(tableX + tableW, seasonY)
    ctx.moveTo(tableX, careerY); ctx.lineTo(tableX + tableW, careerY)
    ctx.moveTo(statColsX, tableTop); ctx.lineTo(statColsX, tableBottom)
    for (let i = 1; i < player.metrics.length; i++) { const dividerX = statColsX + statColsW * i / player.metrics.length; ctx.moveTo(dividerX, tableTop); ctx.lineTo(dividerX, tableBottom) }
    ctx.stroke()
    text(player.coach ? "COACH OVERVIEW" : "PLAYER OVERVIEW", 55, 988, 20, accent)
    const overview = design.overview || "Your player overview will appear here."
    let fontSize = 28, lines: string[] = []
    do {
      ctx.font = `400 ${fontSize}px ${family}`
      lines = []; let line = ""
      for (const character of overview.replace(/\s+/g, " ")) {
        if (ctx.measureText(line + character).width > 890) {
          const split = line.lastIndexOf(" ")
          if (split > 0) { lines.push(line.slice(0, split)); line = line.slice(split + 1) + character }
          else { lines.push(line); line = character }
        } else line += character
      }
      if (line) lines.push(line)
      if (lines.length * (fontSize + 6) <= 210) break
      fontSize--
    } while (fontSize > 12)
    lines.forEach((value, i) => text(value, 55, 1030 + i * (fontSize + 6), fontSize, "#FFFFFF", 400))
    if (player.incomplete) text(player.example ? "— Stats not supplied for this example" : "— Not recorded   * Documented totals; some seasons incomplete", 55, 1232, 18, "#9D9D9D", 400)
    // Footer: a distinct panel band — crest, accent stripe, player name — Hortonville —
    // set apart from the overview text above instead of floating on the bare background.
    ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.fillRect(50, 1248, 900, 140)
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50, 1248); ctx.lineTo(950, 1248); ctx.stroke()
    ctx.drawImage(logo, cooperBack ? 619 : 464, 1264, 72, 72)
    if (kimberly && whitewater) {
      // Trim supplied canvas padding, then fit each mark in a 72px-high box.
      // Source proportions are retained in Kimberly, UWW, Hortonville order.
      const footerLogo = (image: HTMLImageElement, crop: [number, number, number, number], centerX: number, maxWidth: number) => {
        const [sx, sy, sw, sh] = crop
        const scale = Math.min(maxWidth / sw, 72 / sh)
        const width = sw * scale, height = sh * scale
        ctx.drawImage(image, sx, sy, sw, sh, centerX - width / 2, 1300 - height / 2, width, height)
      }
      footerLogo(kimberly, [203, 56, 298, 245], 360, 90)
      footerLogo(whitewater, [20, 200, 1510, 650], 500, 180)
    }
    ctx.fillStyle = foilGradient(50, 1341, 950, 1353); ctx.fillRect(50, 1344, 900, 6)
    ctx.textAlign = "center"; text(cooperBack ? "COOPER RE | KIMBERLY | UWW | HORTONVILLE" : `${player.name.toUpperCase()}  /  HORTONVILLE`, 500, 1380, 27, "#fff", 800, 890); ctx.textAlign = "left"
  }
  ctx.strokeStyle = isIce ? foilGradient(0, 0, CARD_WIDTH, CARD_HEIGHT) : accent; ctx.lineWidth = 12; ctx.strokeRect(6, 6, 988, 1388)
}

export function downloadCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob), link = document.createElement("a")
    link.href = url; link.download = name
    document.body.appendChild(link); link.click(); link.remove()
    // Allow mobile browsers time to hand the file to their download manager.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }, "image/png")
}
