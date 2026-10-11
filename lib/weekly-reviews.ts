import "server-only"
import data from "@/data/coachs-corner/weekly-reviews/reviews.json"

// Keep review content on the server, behind Coach's Corner authentication.
type WeeklyReview = Omit<(typeof data)[number], "sections"> & {
  sections: { title: string; columns: string[]; rows: string[][]; notes?: string[] }[]
}

export const weeklyReviews: WeeklyReview[] = [...data].sort((a, b) => b.published.localeCompare(a.published) || b.version - a.version)

export function getWeeklyReview(id: string) {
  return weeklyReviews.find(review => review.id === id)
}
