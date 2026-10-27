import "server-only"
import group from "@/data/coachs-corner/scouting/group-b.json"
import reports from "@/data/coachs-corner/scouting/reports.json"

const activeOpponents = ["de-pere", "hudson", "eau-claire-memorial"]
export const scoutingReports = activeOpponents.map(slug => reports.find(report => report.slug === slug)!)
export const scoutingGroup = group
export function getScoutingReport(slug: string) { return reports.find(report => report.slug === slug) }
