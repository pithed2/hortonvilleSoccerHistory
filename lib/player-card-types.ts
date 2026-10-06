export type CardMetric = { label: string; season: string; career: string }
export type CardPlayer = { id: string; name: string; number: string; position: string; classYear: string; season: number; careerSpan: string; metrics: CardMetric[]; incomplete: boolean; example?: boolean; coach?: boolean; statsSeason?: number; statsTitle?: string; statsRowLabels?: [string, string]; studioNote?: string }
export type CardPhoto = { src: string; x: number; y: number; zoom: number; fit?: "cover" | "contain" }
export type CardDesign = { portrait: CardPhoto; action: CardPhoto; highlight?: CardPhoto; overview: string; theme: "red" | "black" | "ice"; rightsConfirmed: boolean }
export type PublishedCard = { player: CardPlayer; design: CardDesign; publishedAt: string }
export const blankCardDesign = (): CardDesign => ({ portrait: { src: "", x: 50, y: 50, zoom: 1 }, action: { src: "", x: 50, y: 50, zoom: 1 }, overview: "", theme: "red", rightsConfirmed: false })
