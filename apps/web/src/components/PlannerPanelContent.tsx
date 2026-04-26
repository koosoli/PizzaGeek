import { type ScheduleMode } from "@pizza-geek/core";
import { Segmented } from "./Controls";

export type PlannerShortcut = {
  id: string;
  label: string;
  note: string;
  active: boolean;
  onSelect: () => void;
};

export type PlannerTimelineItem = {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
};

type PlannerPanelContentProps = {
  bakeLabel: string;
  planMode: ScheduleMode;
  readyByLabel: string;
  readyByValue: string;
  readyDateLabel: string;
  readyNowLabel: string;
  quickScheduleLabel: string;
  quickScheduleHint: string;
  startLabel: string;
  startValue: string;
  bakeValue: string;
  shortcuts: PlannerShortcut[];
  timeline: PlannerTimelineItem[];
  onPlanModeChange: (value: ScheduleMode) => void;
  onReadyByChange: (value: string) => void;
};

export function PlannerPanelContent({
  bakeLabel,
  planMode,
  readyByLabel,
  readyByValue,
  readyDateLabel,
  readyNowLabel,
  quickScheduleLabel,
  quickScheduleHint,
  startLabel,
  startValue,
  bakeValue,
  shortcuts,
  timeline,
  onPlanModeChange,
  onReadyByChange
}: PlannerPanelContentProps) {
  return (
    <>
      <Segmented
        value={planMode}
        options={[
          { value: "starting-now", label: readyNowLabel },
          { value: "ready-by", label: readyByLabel }
        ]}
        onChange={(value) => onPlanModeChange(value)}
      />
      {planMode === "ready-by" ? (
        <label className="field single">
          <span>{readyDateLabel}</span>
          <input type="datetime-local" value={readyByValue} onChange={(event) => onReadyByChange(event.target.value)} />
        </label>
      ) : null}
      <div className="plannerSummaryGrid">
        <div className="plannerSummaryCard">
          <span>{startLabel}</span>
          <strong>{startValue}</strong>
        </div>
        <div className="plannerSummaryCard">
          <span>{bakeLabel}</span>
          <strong>{bakeValue}</strong>
        </div>
      </div>
      <div className="plannerQuickSection">
        <div className="panelMetaRow">
          <strong>{quickScheduleLabel}</strong>
          <span className="sectionMeta">{quickScheduleHint}</span>
        </div>
        <div className="plannerShortcutGrid">
          {shortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              className={shortcut.active ? "plannerShortcut active" : "plannerShortcut"}
              type="button"
              onClick={shortcut.onSelect}
            >
              <strong>{shortcut.label}</strong>
              <span>{shortcut.note}</span>
            </button>
          ))}
        </div>
      </div>
      <ol className="timeline">
        {timeline.map((step) => (
          <li key={step.id}>
            <time>{step.timeLabel}</time>
            <strong>{step.title}</strong>
            <span>{step.description}</span>
          </li>
        ))}
      </ol>
    </>
  );
}
