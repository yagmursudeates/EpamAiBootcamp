type Decision = 'screening' | 'under_review' | 'accepted' | 'rejected'

export function buildNotificationMessage(decision: Decision, ideaTitle: string): string {
  switch (decision) {
    case 'screening':
      return `Your idea '${ideaTitle}' has entered the screening stage.`
    case 'accepted':
      return `Your idea '${ideaTitle}' was accepted.`
    case 'rejected':
      return `Your idea '${ideaTitle}' was rejected.`
    case 'under_review':
      return `Your idea '${ideaTitle}' is now under review.`
  }
}
