import { Download, Printer, Share2 } from "lucide-react";
import { Metric } from "./Surface";

type RecipeIngredientRow = {
  label: string;
  value: string;
  pct: string;
  status?: "ok" | "danger";
};

type RecipeMetric = {
  label: string;
  value: string;
};

type RecipeSummaryBlock = {
  title: string;
  lines: string[];
};

type RecipeWaterSummary = {
  title: string;
  useText: string;
  targetText: string;
  noteText?: string;
};

type RecipeSheetPanelContentProps = {
  origin: string;
  title: string;
  flourType: string;
  labels: {
    copy: string;
    export: string;
    print: string;
  };
  ingredients: RecipeIngredientRow[];
  metrics: RecipeMetric[];
  waterSummary: RecipeWaterSummary;
  prefermentSummary?: RecipeSummaryBlock;
  flourBlendSummary?: RecipeSummaryBlock;
  sauceSummary?: RecipeSummaryBlock;
  onCopy: () => void;
  onExport: () => void;
  onPrint: () => void;
};

export function RecipeSheetPanelContent({
  origin,
  title,
  flourType,
  labels,
  ingredients,
  metrics,
  waterSummary,
  prefermentSummary,
  flourBlendSummary,
  sauceSummary,
  onCopy,
  onExport,
  onPrint
}: RecipeSheetPanelContentProps) {
  return (
    <>
      <div className="recipeHeader">
        <div>
          <p className="eyebrow">{origin}</p>
          <h3>{title}</h3>
          <p className="sectionMeta">{flourType}</p>
        </div>
        <div className="buttonRow noPrint">
          <button className="ghostButton" type="button" onClick={onCopy}>
            <Share2 size={16} />
            {labels.copy}
          </button>
          <button className="ghostButton" type="button" onClick={onExport}>
            <Download size={16} />
            {labels.export}
          </button>
          <button className="ghostButton" type="button" onClick={onPrint}>
            <Printer size={16} />
            {labels.print}
          </button>
        </div>
      </div>

      <div className="ingredientTable">
        {ingredients.map((ingredient) => (
          <IngredientRow key={`${ingredient.label}-${ingredient.pct}`} {...ingredient} />
        ))}
      </div>

      <div className="summaryGrid">
        {metrics.map((metric) => (
          <Metric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <div className="splitBox">
        <strong>{waterSummary.title}</strong>
        <span>{waterSummary.useText}</span>
        <span>{waterSummary.targetText}</span>
        {waterSummary.noteText ? <span>{waterSummary.noteText}</span> : null}
      </div>

      {prefermentSummary ? <SummaryBlock {...prefermentSummary} /> : null}
      {flourBlendSummary ? <SummaryBlock {...flourBlendSummary} /> : null}
      {sauceSummary ? <SummaryBlock {...sauceSummary} /> : null}
    </>
  );
}

function SummaryBlock({ title, lines }: RecipeSummaryBlock) {
  return (
    <div className="splitBox">
      <strong>{title}</strong>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

function IngredientRow({ label, value, pct, status = "ok" }: RecipeIngredientRow) {
  return (
    <div className={`ingredient ${status}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{pct}</em>
    </div>
  );
}