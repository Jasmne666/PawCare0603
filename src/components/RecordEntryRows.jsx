import { getRecordSectionSummary, recordEntrySections } from '../data/recordEntrySections.js';

function RecordEntryRows({ disabled, disabledText, onOpenSection, pet, record }) {
  return (
    <section className="overflow-hidden rounded-card border border-paw-border bg-paw-card">
      {disabled && (
        <p className="border-b border-paw-border bg-paw-warning/10 px-4 py-3 text-xs text-paw-secondary">
          {disabledText}
        </p>
      )}
      {recordEntrySections.map((section, index) => (
        <button
          className={`flex w-full items-center gap-3 px-4 py-3 text-left active:scale-100 ${
            index > 0 ? 'border-t border-paw-border' : ''
          } ${disabled ? 'opacity-45' : ''}`}
          disabled={disabled}
          key={section.id}
          onClick={() => onOpenSection(section.id)}
          type="button"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paw-background text-lg">
            {section.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-paw-primary">{section.label}</p>
              <span className="text-[10px] text-paw-muted">✏️</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-paw-muted">
              {getRecordSectionSummary(section.id, record, pet)}
            </p>
          </div>
          <span className="rounded-full bg-paw-healthy/10 px-2 py-1 text-xs font-semibold text-paw-healthy">
            编辑
          </span>
        </button>
      ))}
    </section>
  );
}

export default RecordEntryRows;
