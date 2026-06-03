const avatars = ['🐱', '🐶', '🐰', '🐹', '🐾', '🦊', '🐻', '🐼'];

function PetAvatarPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {avatars.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onChange(avatar)}
          className={`flex aspect-square items-center justify-center rounded-control border text-2xl transition ${
            value === avatar
              ? 'border-paw-healthy bg-[#EEF6F1]'
              : 'border-paw-border bg-paw-background'
          }`}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
}

export default PetAvatarPicker;

