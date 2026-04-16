'use client';

interface ChipGroupProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}

export function ChipGroup({ options, selected, onChange, multi = true }: ChipGroupProps) {
  const toggle = (v: string) => {
    if (selected.includes(v)) {
      onChange(selected.filter((x) => x !== v));
    } else {
      onChange(multi ? [...selected, v] : [v]);
    }
  };

  return (
    <div className="chip-group">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          className={`chip ${selected.includes(opt) ? 'selected' : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
