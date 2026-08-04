import React, {
  type ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  loadStripe,
  type Stripe,
  type StripeEmbeddedCheckout,
} from "@stripe/stripe-js";
import { type CampaignDonateAppProps } from "./types";

// Inline (not delegated to an imported helper) so static analysis tracking
// this value's flow into the href sink below can see the guard directly:
// only http(s) or root-relative URLs may reach the anchor, blocking
// javascript:/data: URL injection via this DOM-attribute-sourced value.
const SAFE_URL_PATTERN = /^(https?:\/\/|\/(?!\/))/i;

const DONATION_COMPLETE_EVENT = "vvp-donation-completed";

export const CampaignDonateThanks = ({
  amount,
  certificateUrl,
}: {
  amount: number;
  certificateUrl?: string;
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
          Deine Spende über {amount.toLocaleString("de-DE")} € wurde gezählt.
          Durch deine Spende ermöglichst du unsere Arbeit weiterzuführen und
          mehr Aktionen wie diese durchzuführen. Gemeinsam mit dir kämpfen wir
          für die Demokratie!
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
    stripePromises.set(publicKey, loadStripe(publicKey));
  }
  return stripePromises.get(publicKey)!;
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
  stripePublicKey,
  paypalClientId,
  presets,
  certificateUrl,
  preview = false,
}: CampaignDonateAppProps): ReactElement => {
  const [selected, setSelected] = useState(presets[1] ?? presets[0] ?? 25);
  const [customAmount, setCustomAmount] = useState("");
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

  const amount = useMemo(() => {
    if (!customAmount) return selected;
    // Accept German-style decimal commas ("35,50") in addition to dots.
    const custom = Number(customAmount.replace(",", "."));
    // Custom input is active but not (yet) a valid amount — don't silently
    // fall back to the last preset, or the donor could end up charged an
    // amount that doesn't match what's shown as selected in the UI.
    if (Number.isNaN(custom) || custom <= 0) return 0;
    return Math.round(custom);
  }, [customAmount, selected]);

  // PayPal's Buttons are only initialized once per mount; createOrder/onApprove
  // are closures captured at that time, so they read the current amount via
  // this ref rather than going stale after the user changes their selection.
  const amountRef = useRef(amount);
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  const finishDonation = (finalAmount: number) => {
    setCompletedAmount(finalAmount);
    setDonationComplete(true);
    window.dispatchEvent(new CustomEvent(DONATION_COMPLETE_EVENT));
  };

  // Some Stripe payment methods (3D Secure, Klarna, Sofort, ...) leave the
  // page entirely instead of completing inline, so onComplete below never
  // fires for them. Stripe's return_url brings the browser back here with
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

    fetch(`${apiBaseUrl}/api/finalize-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json?.recorded) {
          finishDonation(json.amount ?? 0);
        } else {
          setError(json?.error ?? "Zahlung konnte nicht bestätigt werden.");
        }
      })
      .catch(() => {
        setError("Zahlung konnte nicht bestätigt werden.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (preview || !checkoutClientSecret || !checkoutContainerRef.current)
      return;

    let instance: StripeEmbeddedCheckout | null = null;
    let cancelled = false;

    getStripe(stripePublicKey).then(async (stripe) => {
      if (cancelled || !stripe || !checkoutContainerRef.current) return;
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
          finishDonation(amount);
        },
      });
      if (cancelled) {
        instance.destroy();
        return;
      }
      instance.mount(checkoutContainerRef.current);
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
  // amountRef above) as soon as a paypalClientId is configured.
  useEffect(() => {
    if (preview || !paypalClientId || !paypalContainerRef.current) return;

    let cancelled = false;
    let buttons: ReturnType<
      NonNullable<typeof window.paypal>["Buttons"]
    > | null = null;

    loadPayPalSdk(paypalClientId)
      .then(() => {
        if (cancelled || !window.paypal || !paypalContainerRef.current) return;

        buttons = window.paypal.Buttons({
          style: { layout: "horizontal", tagline: false, height: 45 },
          createOrder: async () => {
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
              throw new Error(
                json?.error ?? "Konnte PayPal-Zahlung nicht starten.",
              );
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
            const json = await response.json();
            if (!response.ok || !json?.recorded) {
              setError(json?.error ?? "PayPal-Zahlung fehlgeschlagen.");
              return;
            }
            finishDonation(json.amount ?? amountRef.current);
          },
          onError: () => {
            setError("PayPal-Zahlung fehlgeschlagen. Bitte erneut versuchen.");
          },
        });

        buttons.render(paypalContainerRef.current);
      })
      .catch(() => {
        setError("PayPal konnte nicht geladen werden.");
      });

    return () => {
      cancelled = true;
      buttons?.close?.();
    };
  }, [preview, paypalClientId, apiBaseUrl, campaignKey]);

  const handleStripeSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    if (preview) return;

    setError(null);
    setLoading(true);

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
          body: JSON.stringify({ amount, campaign: campaignKey, returnUrl }),
        },
      );
      const json = await response.json();

      if (!response.ok || !json?.clientSecret) {
        throw new Error(json?.error ?? "Konnte die Zahlung nicht starten.");
      }

      setCheckoutSessionId(json.sessionId as string);
      setCheckoutClientSecret(json.clientSecret as string);
    } catch (err) {
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
  const hasPaypal = Boolean(paypalClientId);

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
              className={`vvp-cd__preset ${amount === value && !customAmount ? "is-active" : ""}`}
              onClick={() => {
                setCustomAmount("");
                setSelected(value);
              }}
            >
              {value} €
            </button>
          ))}
          <input
            id="vvp-cd-custom"
            ref={customInputRef}
            className={`vvp-cd__preset vvp-cd__preset-input ${customAmount ? "is-active" : ""}`}
            type="text"
            inputMode="decimal"
            placeholder="Eigener Betrag..."
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            aria-label="Eigener Betrag eingeben"
          />
        </div>

        <div className="vvp-cd__methods">
          {hasStripe && (
            <button
              className="vvp-cd__submit"
              type="button"
              disabled={loading || amount <= 0}
              onClick={handleStripeSubmit}
            >
              {loading ? "Lädt…" : "Mit Karte/SEPA spenden"}
            </button>
          )}

          {hasStripe && hasPaypal && (
            <div className="vvp-cd__divider">
              <span>oder</span>
            </div>
          )}

          {hasPaypal && (
            <div
              ref={paypalContainerRef}
              className="vvp-cd__paypal"
              aria-label="Mit PayPal spenden"
            />
          )}
        </div>

        {error && <p className="vvp-cd__error">{error}</p>}
      </div>
    </div>
  );
};
