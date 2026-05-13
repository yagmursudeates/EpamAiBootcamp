type Decision = 'under_review' | 'accepted' | 'rejected'

export function buildNotificationMessage(decision: Decision, ideaTitle: string): string {
  switch (decision) {
    case 'accepted':
      return `Your idea '${ideaTitle}' was accepted.`
    case 'rejected':
      return `Your idea '${ideaTitle}' was rejected.`
    case 'under_review':
      return `Your idea '${ideaTitle}' is now under review.`
  }
}
