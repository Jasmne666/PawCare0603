import { getRecordSectionSummary, recordEntrySections } from '../data/recordEntrySections.js';

function RecordEntryRows({ onOpenSection, pet, record }) {
  return (
    <section className="overflow-hidden rounded-card border border-paw-border bg-paw-card">
      {recordEntrySections.map((section, index) => (
        <button
          className={`flex w-full items-center gap-3 px-4 py-3 text-left active:scale-100 ${
            index > 0 ? 'border-t border-paw-border' : ''
          }`}
          key={section.id}
          onClick={() => onOpenSection(section.id)}
          type="button"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paw-background text-lg">
            {section.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-paw-primary">{section.label}</p>
            <p className="mt-0.5 truncate text-xs text-paw-muted">
              {getRecordSectionSummary(section.id, record, pet)}
            </p>
          </div>
          <span className="text-lg leading-none text-paw-muted">＋</span>
        </button>
      ))}
    </section>
  );
}

export default RecordEntryRows;
