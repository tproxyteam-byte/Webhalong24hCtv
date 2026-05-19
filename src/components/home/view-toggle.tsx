"use client";

export type ViewMode = "matrix" | "card";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Chế độ xem"
      className="inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-neutral-50 p-0.5"
    >
      <ToggleButton active={value === "matrix"} onClick={() => onChange("matrix")}>
        <GridIcon />
        Lịch tổng
      </ToggleButton>
      <ToggleButton active={value === "card"} onClick={() => onChange("card")}>
        <CardIcon />
        Thẻ ảnh
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors " +
        (active
          ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200"
          : "text-neutral-500 hover:text-neutral-900")
      }
    >
      {children}
    </button>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="5.5" y="0.5" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="10.5" y="0.5" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="0.5" y="5.5" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="5.5" y="5.5" width="3" height="3" rx="0.5" stroke="currentColor" />
      <rect x="10.5" y="5.5" width="3" height="3" rx="0.5" stroke="currentColor" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="5.5" height="6" rx="1" stroke="currentColor" />
      <rect x="8" y="0.5" width="5.5" height="6" rx="1" stroke="currentColor" />
      <rect x="0.5" y="8" width="5.5" height="5.5" rx="1" stroke="currentColor" />
      <rect x="8" y="8" width="5.5" height="5.5" rx="1" stroke="currentColor" />
    </svg>
  );
}
