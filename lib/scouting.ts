import "server-only"
import group from "@/data/coachs-corner/scouting/group-b.json"
import reports from "@/data/coachs-corner/scouting/reports.json"

export const scoutingReports = reports
export const scoutingGroup = group
export function getScoutingReport(slug: string) { return reports.find(report => report.slug === slug) }
