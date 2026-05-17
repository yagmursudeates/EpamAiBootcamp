import StatusBadge from './StatusBadge';

interface Idea {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const date = new Date(idea.created_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <h3>{idea.title}</h3>
      <p>{idea.category}</p>
      <p>{date}</p>
      <StatusBadge status={idea.status} />
    </div>
  );
}
