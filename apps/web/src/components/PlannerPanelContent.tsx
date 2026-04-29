import { useState } from "react";
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
  note: string;
  progressLabel?: string;
  progressTone?: "done" | "skipped";
  progressTimeLabel?: string;
  durationLabel?: string;
  endLabel?: string;
  kindLabel: string;
  kindTone: "action" | "timed" | "ready";
  statusLabel: string;
  statusTone: "past" | "current" | "next" | "future";
};

export type PrefermentWindowCard = {
  mixAtLabel: string;
  readyFromLabel: string;
  bestWindowLabel: string;
  useByLabel: string;
  mixAtValue: string;
  readyFromValue: string;
  bestWindowValue: string;
  useByValue: string;
};

type PlannerPanelContentProps = {
  bakeLabel: string;
  currentStageLabel: string;
  nextStageLabel: string;
  noCurrentStageLabel: string;
  noNextStageLabel: string;
  noteAddLabel: string;
  noteHideLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  noteShowLabel: string;
  planMode: ScheduleMode;
  prefermentWindow?: PrefermentWindowCard;
  prefermentWindowLabel: string;
  processHint: string;
  processLabel: string;
  readyByLabel: string;
  readyByValue: string;
  readyDateLabel: string;
  readyNowLabel: string;
  clearStepStateLabel: string;
  markDoneLabel: string;
  quickScheduleLabel: string;
  quickScheduleHint: string;
  skipStepLabel: string;
  startLabel: string;
  startValue: string;
  bakeValue: string;
  shortcuts: PlannerShortcut[];
  timeline: PlannerTimelineItem[];
  onTimelineNoteChange: (id: string, value: string) => void;
  onTimelineStepProgressChange: (id: string, value: "done" | "skipped" | null) => void;
  onPlanModeChange: (value: ScheduleMode) => void;
  onReadyByChange: (value: string) => void;
};

export function PlannerPanelContent({
  bakeLabel,
  currentStageLabel,
  nextStageLabel,
  noCurrentStageLabel,
  noNextStageLabel,
  noteAddLabel,
  noteHideLabel,
  noteLabel,
  notePlaceholder,
  noteShowLabel,
  planMode,
  prefermentWindow,
  prefermentWindowLabel,
  processHint,
  processLabel,
  readyByLabel,
  readyByValue,
  readyDateLabel,
  readyNowLabel,
  clearStepStateLabel,
  markDoneLabel,
  quickScheduleLabel,
  quickScheduleHint,
  skipStepLabel,
  startLabel,
  startValue,
  bakeValue,
  shortcuts,
  timeline,
  onTimelineNoteChange,
  onTimelineStepProgressChange,
  onPlanModeChange,
  onReadyByChange
}: PlannerPanelContentProps) {
  const [openNoteIds, setOpenNoteIds] = useState<Record<string, boolean>>({});
  const currentStage = timeline.find((step) => step.statusTone === "current");
  const nextStage = timeline.find((step) => step.statusTone === "next") ?? timeline.find((step) => step.statusTone === "future");

  const toggleNote = (id: string) => {
    setOpenNoteIds((current) => ({
      ...current,
      [id]: !current[id]
    }));
  };

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
      {prefermentWindow ? (
        <div className="plannerProcessSection">
          <div className="panelMetaRow">
            <strong>{prefermentWindowLabel}</strong>
          </div>
          <div className="plannerSummaryGrid prefermentWindowGrid">
            <div className="plannerSummaryCard">
              <span>{prefermentWindow.mixAtLabel}</span>
              <strong>{prefermentWindow.mixAtValue}</strong>
            </div>
            <div className="plannerSummaryCard">
              <span>{prefermentWindow.readyFromLabel}</span>
              <strong>{prefermentWindow.readyFromValue}</strong>
            </div>
            <div className="plannerSummaryCard">
              <span>{prefermentWindow.bestWindowLabel}</span>
              <strong>{prefermentWindow.bestWindowValue}</strong>
            </div>
            <div className="plannerSummaryCard">
              <span>{prefermentWindow.useByLabel}</span>
              <strong>{prefermentWindow.useByValue}</strong>
            </div>
          </div>
        </div>
      ) : null}
      <div className="plannerProcessSection">
        <div className="panelMetaRow">
          <strong>{processLabel}</strong>
          <span className="sectionMeta">{processHint}</span>
        </div>
        <div className="plannerProcessGrid">
          <div className={currentStage ? "plannerStageCard active" : "plannerStageCard"}>
            <span>{currentStageLabel}</span>
            <strong>{currentStage?.title ?? noCurrentStageLabel}</strong>
            <p>
              {currentStage
                ? [currentStage.timeLabel, currentStage.durationLabel ?? currentStage.kindLabel].filter(Boolean).join(" · ")
                : noCurrentStageLabel}
            </p>
          </div>
          <div className={nextStage ? "plannerStageCard queued" : "plannerStageCard"}>
            <span>{nextStageLabel}</span>
            <strong>{nextStage?.title ?? noNextStageLabel}</strong>
            <p>
              {nextStage ? [nextStage.timeLabel, nextStage.durationLabel ?? nextStage.kindLabel].filter(Boolean).join(" · ") : noNextStageLabel}
            </p>
          </div>
        </div>
      </div>
      <ol className="timeline">
        {timeline.map((step) => {
          const noteOpen = openNoteIds[step.id] ?? false;
          const notePreview = step.note.trim() ? summarizePlannerNote(step.note) : noteAddLabel;

          return (
            <li
              key={step.id}
              className={`timelineCard ${step.statusTone} ${step.kindTone}`}
              data-status={step.statusTone}
              data-kind={step.kindTone}
            >
              <div className="timelineRail">
                <time>{step.timeLabel}</time>
              </div>
              <div className="timelineBody">
                <div className="timelineCardHeader">
                  <strong>{step.title}</strong>
                  <span className={`plannerChip status ${step.statusTone}`}>{step.statusLabel}</span>
                </div>
                <div className="timelineMetaRow">
                  <span className={`plannerChip kind ${step.kindTone}`}>{step.kindLabel}</span>
                  {step.durationLabel ? <span className="timelineMetaText">{step.durationLabel}</span> : null}
                  {step.endLabel ? <span className="timelineMetaText">{step.endLabel}</span> : null}
                  {step.progressLabel && step.progressTone ? <span className={`plannerChip progress ${step.progressTone}`}>{step.progressLabel}</span> : null}
                  {step.progressTimeLabel ? <span className="timelineMetaText">{step.progressTimeLabel}</span> : null}
                </div>
                <span>{step.description}</span>
                <div className="timelineActionRow">
                  <button className={`plannerInlineButton timelineNoteToggle ${noteOpen ? "open" : ""}`} type="button" onClick={() => toggleNote(step.id)}>
                    <span className="timelineNotePreview">{notePreview}</span>
                    <span className="timelineToggleLabel">{noteOpen ? noteHideLabel : noteShowLabel}</span>
                  </button>
                  <div className="timelineStepActions">
                    {step.progressTone !== "done" ? (
                      <button className="plannerMiniButton" type="button" onClick={() => onTimelineStepProgressChange(step.id, "done")}>
                        {markDoneLabel}
                      </button>
                    ) : null}
                    {step.progressTone !== "skipped" ? (
                      <button className="plannerMiniButton" type="button" onClick={() => onTimelineStepProgressChange(step.id, "skipped")}>
                        {skipStepLabel}
                      </button>
                    ) : null}
                    {step.progressTone ? (
                      <button className="plannerMiniButton subtle" type="button" onClick={() => onTimelineStepProgressChange(step.id, null)}>
                        {clearStepStateLabel}
                      </button>
                    ) : null}
                  </div>
                </div>
                {noteOpen ? (
                  <label className="field single timelineNoteField">
                    <span>{noteLabel}</span>
                    <textarea
                      value={step.note}
                      placeholder={notePlaceholder}
                      onChange={(event) => onTimelineNoteChange(step.id, event.target.value)}
                    />
                  </label>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function summarizePlannerNote(note: string, maxLength = 72) {
  const normalized = note.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}...`;
}
