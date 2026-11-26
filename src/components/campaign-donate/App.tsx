import React, {
  type ReactElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  loadStripe,
  type Stripe,
  type StripeEmbeddedCheckout,
} from "@stripe/stripe-js";
import { Alert, Button } from "@volksverpetzer/ui-web";
import {
  isPayPalCaptureSuccessful,
  type PayPalCaptureResponse,
} from "./paypal";
import {
  formatSteadyAmounts,
  steadyPlanForAmount,
  steadyPlanUrl,
} from "./steady";
import { parseCustomAmount } from "./amount";
import { trackDonateEvent, type DonateEventProps } from "./tracking";
import { type CampaignDonateAppProps } from "./types";

// Inline (not delegated to an imported helper) so static analysis tracking
// this value's flow into the href sink below can see the guard directly:
// only http(s) or root-relative URLs may reach the anchor, blocking
// javascript:/data: URL injection via this DOM-attribute-sourced value.
const SAFE_URL_PATTERN = /^(https?:\/\/|\/(?!\/))/i;

const DONATION_COMPLETE_EVENT = "vvp-donation-completed";
// Share of the Stripe button that must be visible for "Checkout Button Viewed".
const VIEWED_THRESHOLD = 0.5;

export const CampaignDonateThanks = ({
  amount,
  certificateUrl,
  monthly = false,
}: {
  amount: number;
  certificateUrl?: string;
  monthly?: boolean;
}): ReactElement => {
  let safeCertificateUrl: string | undefined;
  if (certificateUrl && SAFE_URL_PATTERN.test(certificateUrl)) {
    safeCertificateUrl = certificateUrl;
  }

  return (
    <div className="vvp-cd">
      <div className="vvp-cd__thanks">
        <strong>Danke für deine Unterstützung!</strong>
        <p>
          Deine {monthly ? "monatliche Spende" : "Spende"} über{" "}
          {amount.toLocaleString("de-DE")} € wurde gezählt. Durch deine Spende
          ermöglichst du unsere Arbeit weiterzuführen und mehr Aktionen wie
          diese durchzuführen. Gemeinsam mit dir kämpfen wir für die Demokratie!
        </p>
        {safeCertificateUrl && (
          <a
            className="vvp-cd__certificate"
            href={safeCertificateUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Urkunde öffnen (PDF)
          </a>
        )}
      </div>
    </div>
  );
};

const stripePromises = new Map<string, Promise<Stripe | null>>();
const getStripe = (publicKey: string) => {
  if (!stripePromises.has(publicKey)) {
    const promise = loadStripe(publicKey);
    // Forget a failed load, so the next attempt tries again.
    promise.catch(() => stripePromises.delete(publicKey));
    stripePromises.set(publicKey, promise);
  }
  return stripePromises.get(publicKey)!;
};

// The amount of a Stripe checkout, kept across the redirect some payment
// methods make, so failure events after the return still carry it. Only in
// this tab's sessionStorage, keyed by the checkout session; best effort.
const pendingAmountKey = (sessionId: string) => `vvp_cd_amount:${sessionId}`;
const rememberCheckoutAmount = (sessionId: string, amount: number): void => {
  try {
    window.sessionStorage.setItem(pendingAmountKey(sessionId), String(amount));
  } catch {
    // Storage unavailable (private mode, blocked): events go without amount.
  }
};
const takeCheckoutAmount = (sessionId: string): number | undefined => {
  try {
    const value = window.sessionStorage.getItem(pendingAmountKey(sessionId));
    window.sessionStorage.removeItem(pendingAmountKey(sessionId));
    const amount = Number(value);
    return value && amount > 0 ? amount : undefined;
  } catch {
    return undefined;
  }
};

const paypalSdkPromises = new Map<string, Promise<void>>();
const loadPayPalSdk = (clientId: string): Promise<void> => {
  if (!paypalSdkPromises.has(clientId)) {
    paypalSdkPromises.set(
      clientId,
      new Promise((resolve, reject) => {
        if (window.paypal) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture`;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("PayPal SDK konnte nicht geladen werden."));
        document.head.appendChild(script);
      }),
    );
  }
  return paypalSdkPromises.get(clientId)!;
};

export const CampaignDonateApp = ({
  apiBaseUrl,
  campaignKey,
  interval = "once",
  stripePublicKey,
  paypalClientId,
  presets,
  steadyPlans = [],
  certificateUrl,
  preview = false,
}: CampaignDonateAppProps): ReactElement => {
  const monthly = interval === "month";
  // Monthly donations go through Stripe subscriptions or Steady; PayPal
  // here only does one-time payments, so it's hidden in monthly mode.
  const paypalActive = !monthly && Boolean(paypalClientId);
  const defaultPreset = presets[1] ?? presets[0] ?? 25;
  const [selected, setSelected] = useState(defaultPreset);
  // Re-select the default when the presets change (Visual Builder edits,
  // Storybook controls) — otherwise the old amount stays selected without
  // a matching button. Compared by value: edit.tsx builds a new array on
  // every render.
  const presetsKey = presets.join(",");
  const [prevPresetsKey, setPrevPresetsKey] = useState(presetsKey);
  if (presetsKey !== prevPresetsKey) {
    setPrevPresetsKey(presetsKey);
    setSelected(defaultPreset);
  }
  const [customAmount, setCustomAmount] = useState("");
  // Focusing the custom field switches to a custom amount right away:
  // the preset is deselected and Steady (fixed amounts only) is disabled.
  // Leaving it empty switches back to the preset.
  const [customFocused, setCustomFocused] = useState(false);
  // Trimmed, so a whitespace-only value counts as empty (back to the preset).
  const customActive = customFocused || Boolean(customAmount.trim());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<
    string | null
  >(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(
    null,
  );
  const [donationComplete, setDonationComplete] = useState(false);
  const [completedAmount, setCompletedAmount] = useState(0);
  const checkoutContainerRef = useRef<HTMLDivElement | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const customInputRef = useRef<HTMLInputElement | null>(null);
  // Unique per form, so two donation modules on one page don't share ids.
  const idPrefix = useId();
  const customInputId = `${idPrefix}-custom`;
  const steadyHintId = `${idPrefix}-steady-hint`;
  const customHintId = `${idPrefix}-custom-hint`;
  const submitRef = useRef<HTMLButtonElement | null>(null);

  // Plausible events, named like the crowdfunding app's so /weihnachten and
  // crowdfunding.volksverpetzer.de can be compared. Never in the Visual
  // Builder or Storybook (preview).
  const track = (event: string, props?: DonateEventProps) => {
    if (preview) return;
    trackDonateEvent(
      event,
      { campaign: campaignKey, interval: monthly ? "month" : "once" },
      props,
    );
  };
  // Only when the selection actually changes, not on every keystroke that
  // leaves the same amount.
  const lastSelectionRef = useRef<string | null>(null);
  const trackSelection = (value: number, type: "preset" | "custom") => {
    const key = `${type}:${value}`;
    if (lastSelectionRef.current === key) return;
    lastSelectionRef.current = key;
    track("Donation Option Selected", { amount: value, type });
  };

  const amount = useMemo(() => {
    if (!customActive) return selected;
    // Custom input is active but not (yet) a valid amount — don't silently
    // fall back to the last preset, or the donor could end up charged an
    // amount that doesn't match what's shown as selected in the UI.
    return parseCustomAmount(customAmount);
  }, [customActive, customAmount, selected]);
  const customAmountInvalid = Boolean(customAmount.trim()) && amount <= 0;

  // PayPal's Buttons are only initialized once per mount; createOrder/onApprove
  // are closures captured at that time, so they read the current amount via
  // this ref rather than going stale after the user changes their selection.
  const amountRef = useRef(amount);
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  const finishDonation = (
    finalAmount: number,
    provider: "stripe" | "paypal",
  ) => {
    track("Donation Success", { amount: finalAmount, provider });
    setCompletedAmount(finalAmount);
    setDonationComplete(true);
    window.dispatchEvent(new CustomEvent(DONATION_COMPLETE_EVENT));
  };

  // Some Stripe payment methods (3D Secure, Klarna, Bancontact, PayPal, ...)
  // leave the page entirely instead of completing inline, so onComplete below
  // never fires for them. Stripe's return_url brings the browser back here with
  // this marker instead, and we finalize the session client-side the same
  // way onComplete does.
  useEffect(() => {
    if (preview) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("vvp_cd_session_id");
    if (!sessionId) return;

    params.delete("vvp_cd_session_id");
    const cleanedSearch = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${cleanedSearch ? `?${cleanedSearch}` : ""}${window.location.hash}`,
    );
    const checkoutAmount = takeCheckoutAmount(sessionId);

    fetch(`${apiBaseUrl}/api/finalize-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json?.recorded) {
          finishDonation(json.amount ?? 0, "stripe");
        } else {
          track("Checkout Failed", {
            amount: checkoutAmount,
            provider: "stripe",
            reason: json?.error ?? "unconfirmed",
          });
          setError(json?.error ?? "Zahlung konnte nicht bestätigt werden.");
        }
      })
      .catch(() => {
        track("Checkout Error", {
          amount: checkoutAmount,
          provider: "stripe",
          message: "finalize",
        });
        setError("Zahlung konnte nicht bestätigt werden.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (preview || !checkoutClientSecret || !checkoutContainerRef.current)
      return;

    let instance: StripeEmbeddedCheckout | null = null;
    let cancelled = false;

    getStripe(stripePublicKey)
      .then(async (stripe) => {
        if (cancelled || !checkoutContainerRef.current) return;
        // Handled like a failed load by the catch below.
        if (!stripe) throw new Error("stripe-unavailable");
        // @stripe/stripe-js v9 renamed initEmbeddedCheckout -> createEmbeddedCheckoutPage
        // (matches the crowdfunding app's Checkout Session ui_mode: 'embedded_page');
        // same options/return shape, method renamed only.
        instance = await stripe.createEmbeddedCheckoutPage({
          clientSecret: checkoutClientSecret,
          onComplete: () => {
            if (checkoutSessionId) {
              fetch(`${apiBaseUrl}/api/finalize-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: checkoutSessionId }),
              }).catch(() => {});
            }
            finishDonation(amount, "stripe");
          },
        });
        if (cancelled) {
          instance.destroy();
          return;
        }
        instance.mount(checkoutContainerRef.current);
      })
      .catch((err) => {
        if (cancelled) return;
        track("Checkout Error", {
          amount,
          provider: "stripe",
          message: err instanceof Error ? err.message : "stripe-init",
        });
        setError("Die Zahlung konnte nicht geladen werden.");
      });

    return () => {
      cancelled = true;
      instance?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    preview,
    checkoutClientSecret,
    checkoutSessionId,
    apiBaseUrl,
    stripePublicKey,
  ]);

  // Renders the PayPal button once (not re-rendered per amount change — see
  // amountRef above) as soon as a paypalClientId is configured (one-time
  // mode only).
  useEffect(() => {
    if (preview || !paypalActive || !paypalContainerRef.current) return;

    let cancelled = false;
    let buttons: ReturnType<
      NonNullable<typeof window.paypal>["Buttons"]
    > | null = null;
    // Set when the crowdfunding app refuses an order. createOrder then
    // throws and PayPal calls onError, which must not count that refusal as
    // a "Checkout Error" too.
    let refusal: string | null = null;

    loadPayPalSdk(paypalClientId)
      .then(() => {
        if (cancelled || !window.paypal || !paypalContainerRef.current) return;

        buttons = window.paypal.Buttons({
          style: { layout: "horizontal", tagline: false, height: 45 },
          // The container is also disabled while the amount is invalid (see
          // below); this catches anything that still gets through, e.g. a
          // click right as the donor types.
          onClick: (_data, actions) =>
            amountRef.current > 0 ? actions.resolve() : actions.reject(),
          createOrder: async () => {
            if (amountRef.current <= 0) {
              throw new Error("Bitte einen ganzen Euro-Betrag eingeben.");
            }
            track("Checkout Attempted", {
              amount: amountRef.current,
              provider: "paypal",
            });
            const response = await fetch(
              `${apiBaseUrl}/api/paypal-create-order`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  amount: amountRef.current,
                  campaign: campaignKey,
                }),
              },
            );
            const json = await response.json();
            if (!response.ok || !json?.orderID) {
              refusal = json?.error ?? "Konnte PayPal-Zahlung nicht starten.";
              track("Checkout Failed", {
                amount: amountRef.current,
                provider: "paypal",
                reason: json?.error ?? "unknown",
              });
              throw new Error(refusal);
            }
            return json.orderID as string;
          },
          onApprove: async (data) => {
            const response = await fetch(
              `${apiBaseUrl}/api/paypal-capture-order`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID }),
              },
            );
            const json = (await response.json()) as PayPalCaptureResponse;
            if (!isPayPalCaptureSuccessful(response.ok, json)) {
              track("Checkout Failed", {
                amount: amountRef.current,
                provider: "paypal",
                reason: json?.error ?? "unknown",
              });
              setError(json?.error ?? "PayPal-Zahlung fehlgeschlagen.");
              return;
            }
            finishDonation(json.amount ?? amountRef.current, "paypal");
          },
          onError: (err) => {
            if (refusal) {
              setError(refusal);
              refusal = null;
              return;
            }
            track("Checkout Error", {
              amount: amountRef.current,
              provider: "paypal",
              message: err instanceof Error ? err.message : "unknown",
            });
            setError("PayPal-Zahlung fehlgeschlagen. Bitte erneut versuchen.");
          },
        });

        buttons.render(paypalContainerRef.current);
      })
      .catch((err) => {
        if (cancelled) return;
        track("Checkout Error", {
          amount: amountRef.current,
          provider: "paypal",
          message: err instanceof Error ? err.message : "paypal-sdk-load",
        });
        setError("PayPal konnte nicht geladen werden.");
      });

    return () => {
      cancelled = true;
      buttons?.close?.();
    };
    // track/finishDonation are new functions on every render; adding them
    // would re-create the PayPal buttons each time. What they read
    // (preview, campaignKey, the interval) is covered: PayPal only renders
    // in one-time mode, and the amount comes from amountRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, paypalActive, paypalClientId, apiBaseUrl, campaignKey]);

  // Once per page view, when the Stripe button is half visible.
  useEffect(() => {
    const node = submitRef.current;
    if (preview || !node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        // isIntersecting is true at any visibility above 0, e.g. in the
        // first callback right after observe(); require the threshold.
        if (
          entries.some(
            (entry) =>
              entry.isIntersecting &&
              entry.intersectionRatio >= VIEWED_THRESHOLD,
          )
        ) {
          track("Checkout Button Viewed");
          observer.disconnect();
        }
      },
      { threshold: VIEWED_THRESHOLD },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount
  }, [preview]);

  const handleStripeSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    if (preview) return;

    setError(null);
    setLoading(true);
    track("Checkout Attempted", { amount, provider: "stripe" });

    try {
      // Plain string concat, not URLSearchParams: the {CHECKOUT_SESSION_ID}
      // placeholder must reach Stripe unencoded so it can substitute it in
      // before redirecting the browser back here.
      const currentUrl = window.location.href.split("#")[0];
      const separator = currentUrl.includes("?") ? "&" : "?";
      const returnUrl = `${currentUrl}${separator}vvp_cd_session_id={CHECKOUT_SESSION_ID}`;

      const response = await fetch(
        `${apiBaseUrl}/api/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            campaign: campaignKey,
            returnUrl,
            // The crowdfunding app starts a Stripe subscription for "month";
            // only its first payment counts towards the campaign.
            ...(monthly ? { interval: "month" } : {}),
          }),
        },
      );
      const json = await response.json();

      if (!response.ok || !json?.clientSecret) {
        // A refusal by the crowdfunding app: only "Checkout Failed", not
        // also "Checkout Error" from the catch below, which is for network
        // and SDK errors.
        track("Checkout Failed", {
          amount,
          provider: "stripe",
          reason: json?.error ?? "unknown",
        });
        setError(json?.error ?? "Konnte die Zahlung nicht starten.");
        return;
      }

      track("Checkout Embedded Mounted", { amount, provider: "stripe" });
      rememberCheckoutAmount(json.sessionId as string, amount);
      setCheckoutSessionId(json.sessionId as string);
      setCheckoutClientSecret(json.clientSecret as string);
    } catch (err) {
      track("Checkout Error", {
        amount,
        provider: "stripe",
        message: err instanceof Error ? err.message : "unknown",
      });
      setError(
        err instanceof Error ? err.message : "Etwas ist schief gelaufen.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (donationComplete) {
    return (
      <CampaignDonateThanks
        amount={completedAmount}
        certificateUrl={certificateUrl}
        monthly={monthly}
      />
    );
  }

  if (checkoutClientSecret) {
    return (
      <div className="vvp-cd">
        <div ref={checkoutContainerRef} className="vvp-cd__checkout" />
      </div>
    );
  }

  const hasStripe = Boolean(stripePublicKey);
  const hasPaypal = paypalActive;
  const hasSteady = monthly && steadyPlans.length > 0;
  // Steady plans have fixed amounts: the Steady button links to the plan
  // matching the selected preset, and is disabled for a custom amount or a
  // preset without a plan. Custom amounts work with Stripe/PayPal only.
  const steadyPlan = steadyPlanForAmount(steadyPlans, selected, customActive);
  const hasCustomAmount = hasStripe || hasPaypal;

  return (
    <div className="vvp-cd">
      <div className="vvp-cd__form">
        <div
          className="vvp-cd__presets"
          role="group"
          aria-label="Schnellauswahl Betrag"
        >
          {presets.map((value) => (
            <button
              type="button"
              key={value}
              className={`vvp-cd__preset ${selected === value && !customActive ? "is-active" : ""}`}
              onClick={() => {
                setCustomAmount("");
                setSelected(value);
                trackSelection(value, "preset");
              }}
            >
              {value} €
            </button>
          ))}
          {hasCustomAmount && (
            <input
              id={customInputId}
              ref={customInputRef}
              className={`vvp-cd__preset vvp-cd__preset-input ${customActive ? "is-active" : ""}`}
              type="text"
              inputMode="numeric"
              aria-invalid={customAmountInvalid || undefined}
              aria-describedby={customAmountInvalid ? customHintId : undefined}
              placeholder={
                monthly ? "Eigener Betrag/Monat..." : "Eigener Betrag..."
              }
              value={customAmount}
              onFocus={() => setCustomFocused(true)}
              onBlur={() => setCustomFocused(false)}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                const parsed = parseCustomAmount(event.target.value);
                if (parsed > 0) trackSelection(parsed, "custom");
              }}
              aria-label={
                monthly
                  ? "Eigenen monatlichen Betrag eingeben"
                  : "Eigener Betrag eingeben"
              }
            />
          )}
        </div>

        {customAmountInvalid && (
          <p id={customHintId} className="vvp-cd__custom-hint" role="alert">
            Bitte einen ganzen Euro-Betrag eingeben, z. B. 35.
          </p>
        )}

        <div className="vvp-cd__methods">
          {hasStripe && (
            <Button
              variant="accent"
              size="lg"
              ref={submitRef}
              className="vvp-cd__submit"
              type="button"
              disabled={loading || amount <= 0}
              onClick={handleStripeSubmit}
            >
              {loading
                ? "Lädt…"
                : monthly
                  ? "Monatlich mit Karte/SEPA spenden"
                  : "Mit Karte/SEPA spenden"}
            </Button>
          )}

          {(hasStripe && hasPaypal) || (hasStripe && hasSteady) ? (
            <div className="vvp-cd__divider">
              <span>oder</span>
            </div>
          ) : null}

          {hasPaypal && (
            <div
              ref={paypalContainerRef}
              // Not unmounted while the amount is invalid, so the PayPal
              // SDK's buttons stay rendered; just greyed out and not clickable.
              className={`vvp-cd__paypal ${amount <= 0 ? "is-disabled" : ""}`}
              aria-label="Mit PayPal spenden"
              aria-disabled={amount <= 0 || undefined}
            />
          )}

          {hasSteady &&
            (steadyPlan ? (
              <a
                className="vvp-cd__steady-button"
                onClick={() =>
                  track("Steady Clicked", { amount: steadyPlan.amount })
                }
                href={steadyPlanUrl(steadyPlan.planId)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${steadyPlan.amount.toLocaleString("de-DE")} € im Monat mit Steady unterstützen`}
              >
                {/* Styled like Volksverpetzer's "Unterstützen mit Steady"
                    buttons: Steady "S" mark, divider, uppercase label. */}
                <span className="vvp-cd__steady-mark" aria-hidden="true" />
                <span className="vvp-cd__steady-label">
                  Mit Steady unterstützen
                </span>
              </a>
            ) : (
              <>
                {/* A real button, so keyboard and screen reader users reach
                    it and hear that it's unavailable and why (the hint).
                    aria-disabled rather than disabled keeps it focusable. */}
                <button
                  type="button"
                  className="vvp-cd__steady-button is-disabled"
                  aria-disabled="true"
                  aria-describedby={steadyHintId}
                >
                  <span className="vvp-cd__steady-mark" aria-hidden="true" />
                  <span className="vvp-cd__steady-label">
                    Mit Steady unterstützen
                  </span>
                </button>
                <p id={steadyHintId} className="vvp-cd__steady-hint">
                  Steady gibt es nur für {formatSteadyAmounts(steadyPlans)} € im
                  Monat.
                </p>
              </>
            ))}
        </div>

        {error && <Alert variant="error">{error}</Alert>}
      </div>
    </div>
  );
};
