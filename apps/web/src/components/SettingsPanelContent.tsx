import type { ChangeEventHandler, ReactNode } from "react";
import type { SizeUnit, TemperatureUnit } from "@pizza-geek/core";
import type { LocaleCode, ThemeMode, WorkspaceMode } from "../appConfig";
import type { ProductMode } from "../productModes";
import { Segmented, SelectField } from "./Controls";

type SettingsPanelContentProps = {
  language: LocaleCode;
  theme: ThemeMode;
  temperatureUnit: TemperatureUnit;
  sizeUnit: SizeUnit;
  workspaceMode: WorkspaceMode;
  productMode: ProductMode;
  labels: {
    language: string;
    english: string;
    german: string;
    italian: string;
    theme: string;
    dark: string;
    light: string;
    temperatureUnit: string;
    fahrenheit: string;
    celsius: string;
    sizeUnit: string;
    inches: string;
    centimeters: string;
    workspaceMode: string;
    guidedMode: string;
    studioMode: string;
    workspaceHint: string;
    productMode: string;
    pizzaProduct: string;
    breadProduct: string;
    productModeHint: string;
    appInstall: string;
    appInstallHint: string;
    installApp: string;
    installReady: string;
    installedApp: string;
    installUnavailable: string;
    offlineReady: string;
    offlinePending: string;
    offlineNow: string;
    recipeData: string;
    recipeDataHint: string;
    exportData: string;
    importData: string;
  };
  installStatus: {
    canInstall: boolean;
    isInstalled: boolean;
    offlineReady: boolean;
    isOnline: boolean;
  };
  dataTransferNotice: {
    tone: "success" | "error";
    message: string;
  } | null;
  exportIcon?: ReactNode;
  importIcon?: ReactNode;
  onLanguageChange: (value: LocaleCode) => void;
  onThemeChange: (value: ThemeMode) => void;
  onTemperatureUnitChange: (value: TemperatureUnit) => void;
  onSizeUnitChange: (value: SizeUnit) => void;
  onWorkspaceModeChange: (value: WorkspaceMode) => void;
  onProductModeChange: (value: ProductMode) => void;
  onInstallApp: () => void;
  onExportData: () => void;
  onImportData: ChangeEventHandler<HTMLInputElement>;
};

export function SettingsPanelContent({
  language,
  theme,
  temperatureUnit,
  sizeUnit,
  workspaceMode,
  productMode,
  labels,
  installStatus,
  dataTransferNotice,
  exportIcon,
  importIcon,
  onLanguageChange,
  onThemeChange,
  onTemperatureUnitChange,
  onSizeUnitChange,
  onWorkspaceModeChange,
  onProductModeChange,
  onInstallApp,
  onExportData,
  onImportData
}: SettingsPanelContentProps) {
  const showInstallStatus = false;

  return (
    <>
      <div className="fieldGrid compact">
        <SelectField label={labels.language} value={language} onChange={(value) => onLanguageChange(value as LocaleCode)}>
          <option value="en">{labels.english}</option>
          <option value="de">{labels.german}</option>
          <option value="it">{labels.italian}</option>
        </SelectField>
        <SelectField label={labels.theme} value={theme} onChange={(value) => onThemeChange(value as ThemeMode)}>
          <option value="dark">{labels.dark}</option>
          <option value="light">{labels.light}</option>
        </SelectField>
        <SelectField
          label={labels.temperatureUnit}
          value={temperatureUnit}
          onChange={(value) => onTemperatureUnitChange(value as TemperatureUnit)}
        >
          <option value="F">{labels.fahrenheit}</option>
          <option value="C">{labels.celsius}</option>
        </SelectField>
        <SelectField label={labels.sizeUnit} value={sizeUnit} onChange={(value) => onSizeUnitChange(value as SizeUnit)}>
          <option value="in">{labels.inches}</option>
          <option value="cm">{labels.centimeters}</option>
        </SelectField>
      </div>

      <div className="modeRow">
        <Segmented
          label={labels.productMode}
          options={[
            { value: "pizza", label: labels.pizzaProduct },
            { value: "bread", label: labels.breadProduct }
          ]}
          value={productMode}
          onChange={(value) => onProductModeChange(value as ProductMode)}
        />
        <p className="sectionMeta modeHint">{labels.productModeHint}</p>
      </div>

      <div className="modeRow">
        <Segmented
          label={labels.workspaceMode}
          options={[
            { value: "guided", label: labels.guidedMode },
            { value: "studio", label: labels.studioMode }
          ]}
          value={workspaceMode}
          onChange={(value) => onWorkspaceModeChange(value as WorkspaceMode)}
        />
        <p className="sectionMeta modeHint">{labels.workspaceHint}</p>
      </div>

      {showInstallStatus ? (
        <div className="dataPortability">
          <div className="panelMetaRow">
            <strong>{labels.appInstall}</strong>
            <span className="sectionMeta">{labels.appInstallHint}</span>
          </div>
          <div className="dataTransferRow">
            {installStatus.canInstall ? (
              <button className="ghostButton" type="button" onClick={onInstallApp}>
                {labels.installApp}
              </button>
            ) : null}
          </div>
          <p className={`statusNote ${installStatus.isInstalled ? "success" : "notice"}`} aria-live="polite">
            {installStatus.isInstalled
              ? labels.installedApp
              : installStatus.canInstall
                ? labels.installReady
                : labels.installUnavailable}
          </p>
          <p className={`statusNote ${installStatus.offlineReady ? "success" : "notice"}`} aria-live="polite">
            {installStatus.offlineReady ? labels.offlineReady : labels.offlinePending}
          </p>
          {!installStatus.isOnline ? (
            <p className="statusNote notice" aria-live="polite">
              {labels.offlineNow}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="dataPortability">
        <div className="panelMetaRow">
          <strong>{labels.recipeData}</strong>
          <span className="sectionMeta">{labels.recipeDataHint}</span>
        </div>
        <div className="dataTransferRow">
          <button className="ghostButton" type="button" onClick={onExportData}>
            {exportIcon}
            {labels.exportData}
          </button>
          <label className="ghostButton fileButton">
            <input type="file" accept="application/json" onChange={onImportData} />
            {importIcon}
            {labels.importData}
          </label>
        </div>
        {dataTransferNotice ? (
          <p className={`statusNote ${dataTransferNotice.tone}`} aria-live="polite">
            {dataTransferNotice.message}
          </p>
        ) : null}
      </div>
    </>
  );
}
