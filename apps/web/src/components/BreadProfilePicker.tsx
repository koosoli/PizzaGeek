import type { BreadProfile } from "../productModes";

type BreadProfilePickerProps = {
  hint: string;
  profiles: BreadProfile[];
  value: string;
  onChange: (styleId: string) => void;
};

export function BreadProfilePicker({ hint, profiles, value, onChange }: BreadProfilePickerProps) {
  return (
    <div className="stylePickerStack">
      <p className="sectionMeta">{hint}</p>
      <div className="breadProfileGrid">
        {profiles.map((profile) => {
          const active = profile.styleId === value;

          return (
            <button
              key={profile.id}
              className={active ? "breadProfileCard active" : "breadProfileCard"}
              type="button"
              onClick={() => onChange(profile.styleId)}
            >
              <strong>{profile.title}</strong>
              <p>{profile.description}</p>
              <span>{profile.note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
