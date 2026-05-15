import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import IdeaForm from '@/components/IdeaForm'

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-6">Submit a New Idea</h1>
      <Card>
        <CardHeader>
          <CardTitle>Idea Details</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaForm />
        </CardContent>
      </Card>
    </div>
  )
}
