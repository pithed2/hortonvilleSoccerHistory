import fs from "node:fs"
import path from "node:path"

function parseCSV(text: string): { cols: string[]; rows: string[][] } {
  const clean = text.replace(/\r/g, "").replace(/^\uFEFF/, "")
  const lines = clean.split("\n").filter((line) => line.length)
  if (!lines.length) return { cols: [], rows: [] }

  const cols = splitCSVLine(lines[0])
  const rows = lines.slice(1).map(splitCSVLine)
  return { cols, rows }
}

function splitCSVLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQ = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQ = false
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') inQ = true
      else if (ch === ",") {
        out.push(cur)
        cur = ""
      } else {
        cur += ch
      }
    }
  }

  out.push(cur)
  return out
}

function readDataFile(fileName: string): string {
  const filePath = path.join(process.cwd(), "public", "data", fileName)
  if (!fs.existsSync(filePath)) return ""
  return fs.readFileSync(filePath, "utf8")
}

function readRows(fileName: string): Record<string, string>[] {
  const text = readDataFile(fileName)
  if (!text) return []

  const { cols, rows } = parseCSV(text)

  return rows.map((parts) => {
    const row: Record<string, string> = {}
    cols.forEach((col, index) => {
      row[col] = parts[index] ?? ""
    })
    return row
  })
}

export type RosterPlayer = {
  season: number
  player_name: string
  class: string
  number: string
}

export function rosterBySeason(year: number): RosterPlayer[] {
  return readRows("rosters.csv")
    .map((row) => ({
      season: Number(row.season),
      player_name: row.player_name,
      class: row.class,
      number: row.number,
    }))
    .filter((row) => row.season === year)
    .sort((a, b) => a.player_name.localeCompare(b.player_name))
}

