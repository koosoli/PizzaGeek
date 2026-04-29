import { describe, expect, it } from "vitest";
import {
  formatPlannerDuration,
  getPlannerKindLabel,
  getPlannerProgressLabel,
  getPlannerShortcutLabel,
  getPlannerStatusLabel
} from "../planner";

describe("planner helpers", () => {
  it("formats planner durations by locale", () => {
    expect(formatPlannerDuration(0, "en")).toBe("Immediate");
    expect(formatPlannerDuration(125, "en")).toBe("2h 5m");
    expect(formatPlannerDuration(125, "de")).toBe("2 Std. 5 Min.");
    expect(formatPlannerDuration(45, "it")).toBe("45 min");
  });

  it("localizes planner status and progress labels", () => {
    expect(getPlannerStatusLabel("next", "en")).toBe("Up next");
    expect(getPlannerStatusLabel("current", "de")).toBe("Jetzt");
    expect(getPlannerProgressLabel("skipped", "it")).toBe("Saltato");
    expect(getPlannerKindLabel("action", "en")).toBe("Hands-on");
  });

  it("chooses the correct planner shortcut labels for pizza and bread modes", () => {
    const labels = {
      quickSchedule: "Quick schedule",
      rapidTarget: "Rapid",
      todayTarget: "Same Day",
      overnightTarget: "Overnight",
      twoDayTarget: "2-Day",
      threeDayTarget: "3-Day",
      breadExpressTarget: "Mix & Bake",
      breadTodayTarget: "Same-Day Loaf",
      breadOvernightTarget: "Next Morning",
      breadTwoDayTarget: "Slow Flavor",
      breadThreeDayTarget: "Weekend Loaf"
    };

    expect(getPlannerShortcutLabel("rapid", labels, false)).toBe("Rapid");
    expect(getPlannerShortcutLabel("sameDay", labels, false)).toBe("Same Day");
    expect(getPlannerShortcutLabel("express", labels, true)).toBe("Mix & Bake");
    expect(getPlannerShortcutLabel("threeDay", labels, true)).toBe("Weekend Loaf");
  });
});