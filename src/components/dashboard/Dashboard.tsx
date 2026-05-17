'use client';

import { useEffect, useState } from 'react';
import IdeaCard from '@/components/ideas/IdeaCard';
import type { MockSession } from '@/__tests__/helpers/auth';

interface Idea {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

interface DashboardProps {
  session: MockSession;
}

export default function Dashboard({ session }: DashboardProps) {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);

  useEffect(() => {
    fetch('/api/ideas')
      .then((r) => r.json())
      .then((data) => setIdeas(data.ideas));
  }, []);

  if (ideas === null) return <p>Loading…</p>;

  if (ideas.length === 0) {
    return (
      <div>
        <p>You have not submitted any ideas yet.</p>
        <a href="/submit">Submit your first idea</a>
      </div>
    );
  }

  return (
    <ul>
      {ideas.map((idea) => (
        <li key={idea.id}>
          <IdeaCard idea={idea} />
        </li>
      ))}
    </ul>
  );
}
