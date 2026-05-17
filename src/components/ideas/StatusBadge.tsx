const STATUS_CLASSES: Record<string, string> = {
  accepted: 'badge badge-green',
  rejected: 'badge badge-red',
  submitted: 'badge badge-gray',
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const className = STATUS_CLASSES[status] ?? 'badge badge-gray';
  return <span className={className}>{status}</span>;
}
