import StatusBadge from './StatusBadge';

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
}

interface Attachment {
  filename: string;
  url: string;
}

interface Evaluation {
  notes: string;
}

interface IdeaDetailPageProps {
  idea: Idea;
  attachment: Attachment | null;
  evaluation: Evaluation | null;
}

export default function IdeaDetailPage({ idea, attachment, evaluation }: IdeaDetailPageProps) {
  const date = new Date(idea.created_at).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article>
      <h1>{idea.title}</h1>
      <p>{idea.description}</p>
      <p>{idea.category}</p>
      <StatusBadge status={idea.status} />
      <p>{date}</p>
      {attachment && (
        <a href={attachment.url}>{attachment.filename}</a>
      )}
      {evaluation && (
        <section>
          <h2>Evaluation Notes</h2>
          <p>{evaluation.notes}</p>
        </section>
      )}
    </article>
  );
}
