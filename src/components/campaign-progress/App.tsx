import React, { type ReactElement, useEffect, useState } from "react";
import { ProgressBar } from "@volksverpetzer/ui-web";
import { type CampaignProgressAppProps, type CampaignSummary } from "./types";
import { POLL_INTERVAL_MS, DONATION_COMPLETE_EVENT } from "./constants";

export const CampaignProgressApp = ({
  total: initialTotal,
  goal: initialGoal,
  goalOverride,
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
        // A goal explicitly configured in the Divi module always wins over
        // whatever the campaign API reports — only follow the API's goal
        // when no override was configured.
        if (
          goalOverride === undefined &&
          typeof data.goal === "number" &&
          data.goal > 0
        ) {
          setGoal(data.goal);
        }
      } catch {
        // Keep showing the last known value on a failed poll.
      }
    };

    fetchSummary();
    const interval = window.setInterval(fetchSummary, POLL_INTERVAL_MS);

    // CampaignDonate (a separate module instance/React root) dispatches this
    // on the window right after a successful payment, so a donor's own
    // contribution shows up immediately instead of waiting for the next
    // scheduled poll.
    window.addEventListener(DONATION_COMPLETE_EVENT, fetchSummary);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(DONATION_COMPLETE_EVENT, fetchSummary);
    };
  }, [apiUrl, goalOverride]);

  return <ProgressBar total={total} goal={goal} />;
};
