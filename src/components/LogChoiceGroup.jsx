function LogChoiceGroup({ options, value, onChange, getLabel = (option) => option }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const label = getLabel(option);
        const selected = value === label;

        return (
          <button
            className={`rounded-control border px-3 py-2 text-sm font-semibold transition ${
              selected
                ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
                : 'border-paw-border bg-paw-background text-paw-muted'
            }`}
            key={label}
            onClick={() => onChange(label)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default LogChoiceGroup;
