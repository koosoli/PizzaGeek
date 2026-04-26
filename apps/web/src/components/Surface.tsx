import type { ReactNode } from "react";

export function PanelTitle({
  icon,
  label,
  summary,
  action,
  collapseAction,
  collapsed
}: {
  icon: ReactNode;
  label: string;
  summary?: string;
  action?: ReactNode;
  collapseAction?: ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div className={`panelTitle ${collapsed ? "collapsed" : ""}`}>
      <div className="panelTitleText">
        <span>
          {icon}
          {label}
        </span>
        {summary ? <p className="panelSummary">{summary}</p> : null}
      </div>
      {action || collapseAction ? (
        <div className="panelActionRow noPrint">
          {action ? <div className="panelAction">{action}</div> : null}
          {collapseAction ? <div className="panelAction">{collapseAction}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Notice({
  children,
  tone
}: {
  children: ReactNode;
  tone: "ok" | "notice" | "warning" | "danger";
}) {
  return <p className={`notice ${tone}`}>{children}</p>;
}
