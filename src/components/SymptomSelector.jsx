function SymptomSelector({ options, value, onChange }) {
  const toggleSymptom = (symptom) => {
    const nextValue = value.includes(symptom)
      ? value.filter((item) => item !== symptom)
      : [...value, symptom];
    onChange(nextValue);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((symptom) => {
        const selected = value.includes(symptom);

        return (
          <button
            className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
              selected
                ? 'border-paw-danger bg-paw-danger/10 text-paw-danger'
                : 'border-paw-border bg-paw-background text-paw-muted'
            }`}
            key={symptom}
            onClick={() => toggleSymptom(symptom)}
            type="button"
          >
            {symptom}
          </button>
        );
      })}
    </div>
  );
}

export default SymptomSelector;
