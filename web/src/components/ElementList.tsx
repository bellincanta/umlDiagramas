import { useId } from "react";

export interface ElementListItem {
  id: string;
  label: string;
}

interface ElementListProps {
  heading: string;
  emptyMessage: string;
  items: ElementListItem[];
  onDelete: (id: string) => void;
  deletingId?: string;
}

export function ElementList({ heading, emptyMessage, items, onDelete, deletingId }: ElementListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>{heading}</h3>
      {items.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul className="element-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>
              <button type="button" onClick={() => onDelete(item.id)} disabled={deletingId === item.id}>
                Remover<span className="visually-hidden"> {item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
