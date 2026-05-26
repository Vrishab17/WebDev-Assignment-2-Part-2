export default function StatusBadge({ value }: { value: string }) {
    return <span className={`badge ${value.toLowerCase()}`}>{value}</span>;
  }