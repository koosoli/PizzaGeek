import { STYLE_IDS, type PizzaStyle } from "@pizza-geek/core";

const FEATURED_STYLE_IDS = new Set<string>([
  STYLE_IDS.NEAPOLITAN,
  STYLE_IDS.CONTEMPORARY_NEAPOLITAN,
  STYLE_IDS.NEW_YORK,
  STYLE_IDS.DETROIT,
  STYLE_IDS.SICILIAN,
  STYLE_IDS.FOCACCIA
]);

export type StylePickerGroup = {
  parent: PizzaStyle;
  variants: PizzaStyle[];
};

type StylePickerProps = {
  groups: StylePickerGroup[];
  guidedHint: string;
  mode: "guided" | "studio";
  styleLibraryLabel: string;
  value: string;
  variantsLabel: string;
  onChange: (styleId: string) => void;
};

export function StylePicker({
  groups,
  guidedHint,
  mode,
  styleLibraryLabel,
  value,
  variantsLabel,
  onChange
}: StylePickerProps) {
  const featuredGroups = groups.filter(({ parent }) => FEATURED_STYLE_IDS.has(parent.id));
  const groupsToRender = mode === "guided" && featuredGroups.length > 0 ? featuredGroups : groups;

  return (
    <div className="stylePickerStack">
      {mode === "guided" ? <p className="sectionMeta">{guidedHint}</p> : null}
      <div className={mode === "guided" ? "styleGrid styleGridGuided" : "styleGrid"}>
        {groupsToRender.map(({ parent, variants }) => {
          const parentActive = parent.id === value;
          const variantActive = variants.some((variant) => variant.id === value);
          const selectedStyleId = parentActive ? parent.id : variantActive ? value : parent.id;

          return (
            <div className={parentActive || variantActive ? "styleGroupCard activeFamily" : "styleGroupCard"} key={parent.id}>
              <button
                aria-pressed={parentActive}
                className={parentActive ? "styleButton stylePrimaryButton active" : "styleButton stylePrimaryButton"}
                type="button"
                onClick={() => onChange(parent.id)}
              >
                <strong>{parent.name}</strong>
                <span>{parent.flourType}</span>
                <small>{parent.origin}</small>
              </button>
              <div className="styleVariantFooter">
                {variants.length ? (
                  <>
                    <p className="styleVariantHeading">{variantsLabel}</p>
                    <select className="styleVariantSelect" value={selectedStyleId} onChange={(event) => onChange(event.target.value)}>
                      <option value={parent.id}>{parent.name}</option>
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.variantLabel ?? variant.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="styleVariantPlaceholder" aria-hidden="true" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {mode === "guided" ? (
        <label className="field single">
          <span>{styleLibraryLabel}</span>
          <select className="styleLibrarySelect" value={value} onChange={(event) => onChange(event.target.value)}>
            {groups.map(({ parent, variants }) =>
              variants.length > 0 ? (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name}</option>
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.variantLabel ?? variant.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              )
            )}
          </select>
        </label>
      ) : null}
    </div>
  );
}
