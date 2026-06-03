function ProfileField({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-semibold text-paw-secondary">
        {label}
        {hint && <span className="text-xs font-normal text-paw-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export default ProfileField;
