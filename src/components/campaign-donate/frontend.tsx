import * as React from "react";
import { createRoot } from "react-dom/client";
import { CampaignDonateApp } from "./App";

const parsePresets = (input: string): number[] => {
  const values = input
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length > 0 ? values : [10, 50, 100];
};

const initAll = () => {
  const mounts = document.querySelectorAll<HTMLElement>(
    '.vvp-cd__mount:not([data-cd-initialized="true"])',
  );
  mounts.forEach((mount) => {
    const apiBaseUrl = mount.getAttribute("data-api-base") || "";
    const campaignKey = mount.getAttribute("data-campaign-key") || "";
    const stripePublicKey = mount.getAttribute("data-stripe-key") || "";
    const paypalClientId = mount.getAttribute("data-paypal-client-id") || "";

    if (!apiBaseUrl || !campaignKey || (!stripePublicKey && !paypalClientId)) {
      return;
    }

    mount.setAttribute("data-cd-initialized", "true");

    const presets = parsePresets(
      mount.getAttribute("data-presets") || "10,50,100",
    );
    const certificateUrl =
      mount.getAttribute("data-certificate-url") || undefined;

    createRoot(mount).render(
      <CampaignDonateApp
        apiBaseUrl={apiBaseUrl}
        campaignKey={campaignKey}
        stripePublicKey={stripePublicKey}
        paypalClientId={paypalClientId}
        presets={presets}
        certificateUrl={certificateUrl}
      />,
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}

document.addEventListener("et_pb_reinit_modules", initAll);
document.addEventListener("ajaxComplete", initAll);

if (document.body && "MutationObserver" in window) {
  const observer = new MutationObserver(initAll);
  observer.observe(document.body, { childList: true, subtree: true });
}
