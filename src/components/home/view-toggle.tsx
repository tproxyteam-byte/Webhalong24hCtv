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
      className="inline-flex h-9 items-center rounded-lg border border-neutral-200/80 bg-neutral-100/70 p-0.5"
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
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-all " +
        (active
          ? "bg-white text-teal-800 shadow-[0_2px_6px_rgba(13,148,136,0.06)] ring-1 ring-neutral-200/50"
          : "text-neutral-500 hover:text-neutral-800")
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
