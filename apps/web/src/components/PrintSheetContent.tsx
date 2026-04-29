import type { CalculatorInput, DoughResult, SauceRecipeOption, SizeUnit, TemperatureUnit } from "@pizza-geek/core";
import type { LocaleCode } from "../appConfig";
import { type BlendBreakdownRow } from "../blendBreakdown";
import { type CopyText } from "../copy";
import { formatArea, formatSizePresetLabel, getLengthSuffix, formatTemperature } from "../appHelpers";
import { getFermentationStageContent } from "./FermentationPanelContent";
import { formatBakeWindow, localizeWaterMessage } from "../recipeText";
import { localizeSauceSaltWarning } from "../sauceText";

type PrintSheetContentProps = {
  activeStyle: {
    origin: string;
    name: string;
    flourType: string;
  };
  appVersion: string;
  batchDescriptor: string;
  blendBreakdown: BlendBreakdownRow[];
  displayRecipeName: string;
  localizedSelectedSauceOption?: SauceRecipeOption;
  mainDoughAdditionsText: string;
  methodSteps: string[];
  normalizedInput: CalculatorInput;
  ovenDetail?: string;
  prefermentFlourGrams: number;
  prefermentMode: string;
  prefermentName: string;
  prefermentSplitText: string;
  result: DoughResult;
  sauceSaltWarning: string;
  sauceUi: {
    ingredients: string;
    instructions: string;
    source: string;
    yield: string;
    proTip: string;
    madeWith: string;
  };
  settings: {
    language: LocaleCode;
    sizeUnit: SizeUnit;
    temperatureUnit: TemperatureUnit;
  };
  t: CopyText;
  waterSummary: {
    title: string;
    useText: string;
    targetText: string;
  };
};

export function PrintSheetContent({
  activeStyle,
  appVersion,
  batchDescriptor,
  blendBreakdown,
  displayRecipeName,
  localizedSelectedSauceOption,
  mainDoughAdditionsText,
  methodSteps,
  normalizedInput,
  ovenDetail,
  prefermentFlourGrams,
  prefermentMode,
  prefermentName,
  prefermentSplitText,
  result,
  sauceSaltWarning,
  sauceUi,
  settings,
  t,
  waterSummary
}: PrintSheetContentProps) {
  return (
    <section className="printSheet">
      <div className="printSheetHeader">
        <p className="printKicker">{waterSummary.useText}</p>
        <div className="printTitleRow">
          <div>
            <p className="eyebrow">{activeStyle.origin}</p>
            <h2>{displayRecipeName}</h2>
            <p className="printSubtitle">
              {activeStyle.name} · {activeStyle.flourType} · {batchDescriptor}
            </p>
          </div>
          <div className="printMetricRow">
            <div>
              <span>{t.flour}</span>
              <strong>{result.ingredients.totalFlour}g</strong>
            </div>
            <div>
              <span>{t.water}</span>
              <strong>{result.ingredients.totalWater}g</strong>
            </div>
            <div>
              <span>{t.waterTemp}</span>
              <strong>{formatTemperature(result.waterTemperature.waterTempF, settings.temperatureUnit)}</strong>
            </div>
            <div>
              <span>{t.bake}</span>
              <strong>{formatTemperature(result.oven.tempF, settings.temperatureUnit)}</strong>
            </div>
          </div>
        </div>
      </div>

      {normalizedInput.flourBlendEnabled ? (
        <section className="printSection">
          <h3>{t.flourBlend}</h3>
          <ul className="printBulletList">
            {blendBreakdown.map((item) => (
              <li key={`${item.flourId}-print`}>
                <strong>{item.flourLabel}</strong>: {item.percentage}% · {item.totalGrams}g
                {prefermentMode !== "none"
                  ? ` · ${item.prefermentGrams}g ${prefermentName} · ${item.mainDoughGrams}g ${t.mainDoughAdditions.toLowerCase()}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="printSection">
        <h3>{sauceUi.ingredients}</h3>
        <div className="printIngredients">
          <div className="printIngredientRow">
            <span>{t.flour}</span>
            <strong>{result.ingredients.totalFlour}g</strong>
            <em>100%</em>
          </div>
          <div className="printIngredientRow">
            <span>{t.water}</span>
            <strong>{result.ingredients.totalWater}g</strong>
            <em>{result.percentages.hydration}%</em>
          </div>
          <div className="printIngredientRow">
            <span>{t.salt}</span>
            <strong>{result.ingredients.totalSalt}g</strong>
            <em>{result.percentages.salt}%</em>
          </div>
          <div className="printIngredientRow">
            <span>{t.yeast}</span>
            <strong>{result.ingredients.totalYeast}g</strong>
            <em>{result.percentages.yeast}%</em>
          </div>
          {result.ingredients.totalOil > 0 ? (
            <div className="printIngredientRow">
              <span>{t.oil}</span>
              <strong>{result.ingredients.totalOil}g</strong>
              <em>{result.percentages.oil}%</em>
            </div>
          ) : null}
          {result.ingredients.totalSugar > 0 ? (
            <div className="printIngredientRow">
              <span>{t.sugar}</span>
              <strong>{result.ingredients.totalSugar}g</strong>
              <em>{result.percentages.sugar}%</em>
            </div>
          ) : null}
          {result.ingredients.totalHoney > 0 ? (
            <div className="printIngredientRow">
              <span>{t.honey}</span>
              <strong>{result.ingredients.totalHoney}g</strong>
              <em>{result.percentages.honey}%</em>
            </div>
          ) : null}
          {result.ingredients.totalMalt > 0 ? (
            <div className="printIngredientRow">
              <span>{t.malt}</span>
              <strong>{result.ingredients.totalMalt}g</strong>
              <em>{result.percentages.malt}%</em>
            </div>
          ) : null}
          {result.ingredients.totalLard > 0 ? (
            <div className="printIngredientRow">
              <span>{t.lard}</span>
              <strong>{result.ingredients.totalLard}g</strong>
              <em>{result.percentages.lard}%</em>
            </div>
          ) : null}
          {result.ingredients.totalMilkPowder > 0 ? (
            <div className="printIngredientRow">
              <span>{t.milkPowder}</span>
              <strong>{result.ingredients.totalMilkPowder}g</strong>
              <em>{result.percentages.milkPowder}%</em>
            </div>
          ) : null}
        </div>
        {prefermentMode !== "none" ? (
          <div className="printCallout">
            <strong>{t.prefermentSplit}</strong>
            <span>{prefermentSplitText}</span>
            <span>{mainDoughAdditionsText}</span>
          </div>
        ) : null}
      </section>

      <section className="printSection">
        <h3>{t.fermentation}</h3>
        <div className="printFermentGrid">
          {[
            {
              key: "bulk" as const,
              hours: normalizedInput.fermentation.roomTempHours,
              tempF: normalizedInput.fermentation.roomTempF
            },
            {
              key: "temper" as const,
              hours: normalizedInput.fermentation.finalRiseHours,
              tempF: normalizedInput.fermentation.roomTempF
            },
            {
              key: "cold-ball" as const,
              hours: normalizedInput.fermentation.coldBallHours,
              tempF: normalizedInput.fermentation.fridgeTempF
            },
            {
              key: "cold-bulk" as const,
              hours: normalizedInput.fermentation.coldBulkHours,
              tempF: normalizedInput.fermentation.fridgeTempF
            },
            {
              key: "cellar" as const,
              hours: normalizedInput.fermentation.cellarTempHours,
              tempF: normalizedInput.fermentation.cellarTempF
            }
          ].map((stage) => {
            const content = getFermentationStageContent(stage.key, settings.language);
            return (
              <div className="printFermentCard" key={stage.key}>
                <strong>{content.title}</strong>
                <span>{content.subtitle}</span>
                <b>
                  {stage.hours}h @ {formatTemperature(stage.tempF, settings.temperatureUnit)}
                </b>
                {content.note ? <p>{content.note}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="printSection printColumns">
        <div>
          <h3>{waterSummary.title}</h3>
          <p>{waterSummary.useText}</p>
          <p>{waterSummary.targetText}</p>
          {result.waterTemperature.warning ? <p>{localizeWaterMessage(result.waterTemperature.warning, settings.language)}</p> : null}
        </div>
        <div>
          <h3>{t.bake}</h3>
          <p>{formatBakeWindow(result.oven, settings.language, settings.temperatureUnit, ovenDetail)}</p>
          {result.pan ? (
            <p>
              {t.panGeometry}: {formatArea(result.pan.areaSqIn, settings.sizeUnit)}, {t.depth.toLowerCase()} {normalizedInput.pan.depth}
              {getLengthSuffix(settings.sizeUnit)}
            </p>
          ) : null}
        </div>
      </section>

      <section className="printSection">
        <h3>{t.method}</h3>
        <ol className="printMethodList">
          {methodSteps.map((instruction) => (
            <li key={`print-${instruction}`}>{instruction}</li>
          ))}
        </ol>
      </section>

      {localizedSelectedSauceOption && result.sauce ? (
        <section className="printSection">
          <h3>
            {t.sauce}: {localizedSelectedSauceOption.name}
          </h3>
          <p className="printSauceMeta">
            {settings.language === "de"
              ? `${result.sauce.perPizzaGrams}g / Pizza · ${result.sauce.totalGrams}g gesamt`
              : settings.language === "it"
                ? `${result.sauce.perPizzaGrams}g / pizza · ${result.sauce.totalGrams}g totali`
                : `${result.sauce.perPizzaGrams}g / pizza · ${result.sauce.totalGrams}g total`}
            {localizedSelectedSauceOption.source ? ` · ${sauceUi.source}: ${localizedSelectedSauceOption.source}` : ""}
            {localizedSelectedSauceOption.yield ? ` · ${sauceUi.yield}: ${localizedSelectedSauceOption.yield}` : ""}
          </p>
          <p className="printSauceWarning">{localizeSauceSaltWarning(sauceSaltWarning, settings.language)}</p>
          <div className="printColumns">
            <div>
              <h4>{sauceUi.ingredients}</h4>
              <ul className="printBulletList">
                {localizedSelectedSauceOption.ingredients.map((ingredient) => (
                  <li key={`print-sauce-${ingredient.item}`}>
                    <strong>{ingredient.item}</strong>: {ingredient.amount}
                    {ingredient.note ? ` - ${ingredient.note}` : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>{sauceUi.instructions}</h4>
              <ol className="printMethodList compact">
                {localizedSelectedSauceOption.instructions.map((instruction) => (
                  <li key={`print-sauce-step-${instruction}`}>{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
          {localizedSelectedSauceOption.proTip ? (
            <div className="printCallout">
              <strong>{sauceUi.proTip}</strong>
              <span>{localizedSelectedSauceOption.proTip}</span>
            </div>
          ) : null}
        </section>
      ) : null}

      <footer className="printFooter">
        {sauceUi.madeWith} · v{appVersion} · GPL-3.0
      </footer>
    </section>
  );
}