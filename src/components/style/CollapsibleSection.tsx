import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-3 rounded overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-surface-2 hover:bg-surface-3 transition-colors text-xs font-medium text-gray-300"
      >
        <span>{title}</span>
        <svg
          className={`w-3 h-3 transition-transform text-gray-500 ${
            open ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      {open && <div className="p-3 space-y-3 bg-surface-1">{children}</div>}
    </div>
  );
}
