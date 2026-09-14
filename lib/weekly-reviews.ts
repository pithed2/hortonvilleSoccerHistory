import "server-only"
import data from "@/data/coachs-corner/weekly-reviews/reviews.json"

// Keep review content on the server, behind Coach's Corner authentication.
export const weeklyReviews = [...data].sort((a, b) => b.published.localeCompare(a.published) || b.version - a.version)

export function getWeeklyReview(id: string) {
  return weeklyReviews.find(review => review.id === id)
}
