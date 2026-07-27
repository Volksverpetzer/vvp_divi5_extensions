import React, { type ReactElement, useEffect, useState } from "react";
import { type CampaignProgressAppProps, type CampaignSummary } from "./types";
import { POLL_INTERVAL_MS } from "./constants";

// Inline (not delegated to an imported helper) so static analysis tracking
// this value's flow into the href sink below can see the guard directly:
// only http(s) or root-relative URLs may reach the anchor, blocking
// javascript:/data: URL injection via this DOM-attribute-sourced value.
const SAFE_URL_PATTERN = /^(https?:\/\/|\/(?!\/))/i;

const formatEuro = (value: number): string =>
  value.toLocaleString("de-DE", { minimumFractionDigits: 0 }) + " €";

export const CampaignProgressApp = ({
  total: initialTotal,
  goal: initialGoal,
  donateUrl,
  donateLabel,
  apiUrl,
}: CampaignProgressAppProps): ReactElement => {
  const [total, setTotal] = useState(initialTotal);
  const [goal, setGoal] = useState(initialGoal);

  useEffect(() => {
    if (!apiUrl) return;

    let cancelled = false;

    const fetchSummary = async () => {
      try {
        const response = await fetch(apiUrl, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const data: CampaignSummary = await response.json();
        if (cancelled) return;
        if (typeof data.totalRaised === "number") setTotal(data.totalRaised);
        if (typeof data.goal === "number" && data.goal > 0) setGoal(data.goal);
      } catch {
        // Keep showing the last known value on a failed poll.
      }
    };

    fetchSummary();
    const interval = window.setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [apiUrl]);

  const percent =
    goal > 0 ? Math.min(100, Math.max(0, (total / goal) * 100)) : 0;

  let safeDonateUrl: string | undefined;
  if (donateUrl && SAFE_URL_PATTERN.test(donateUrl)) {
    safeDonateUrl = donateUrl;
  }

  return (
    <div className="vvp-cp">
      <div className="vvp-cp__amounts">
        <span className="vvp-cp__total">{formatEuro(total)}</span>
        <span className="vvp-cp__goal">von {formatEuro(goal)}</span>
      </div>
      <div
        className="vvp-cp__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(total, goal)}
        aria-label={`${formatEuro(total)} von ${formatEuro(goal)} gesammelt`}
      >
        <div className="vvp-cp__fill" style={{ width: `${percent}%` }} />
      </div>
      {safeDonateUrl && (
        <a className="vvp-cp__donate" href={safeDonateUrl}>
          {donateLabel || "Jetzt spenden"}
        </a>
      )}
    </div>
  );
};
