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
import { isSafeUrl } from "../../utils/safeUrl";

const stripePromises = new Map<string, Promise<Stripe | null>>();
const getStripe = (publicKey: string) => {
  if (!stripePromises.has(publicKey)) {
    stripePromises.set(publicKey, loadStripe(publicKey));
  }
  return stripePromises.get(publicKey)!;
};

export const CampaignDonateApp = ({
  apiBaseUrl,
  campaignKey,
  stripePublicKey,
  presets,
  certificateUrl,
  preview = false,
}: CampaignDonateAppProps): ReactElement => {
  const [selected, setSelected] = useState(
    presets[Math.floor(presets.length / 2)] ?? 25,
  );
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
  const checkoutContainerRef = useRef<HTMLDivElement | null>(null);

  const amount = useMemo(() => {
    const custom = Number(customAmount);
    if (customAmount && !Number.isNaN(custom) && custom > 0)
      return Math.round(custom);
    return selected;
  }, [customAmount, selected]);

  useEffect(() => {
    if (preview || !checkoutClientSecret || !checkoutContainerRef.current)
      return;

    let instance: StripeEmbeddedCheckout | null = null;
    let cancelled = false;

    getStripe(stripePublicKey).then(async (stripe) => {
      if (cancelled || !stripe || !checkoutContainerRef.current) return;
      instance = await stripe.initEmbeddedCheckout({
        clientSecret: checkoutClientSecret,
        onComplete: () => {
          if (checkoutSessionId) {
            fetch(`${apiBaseUrl}/api/finalize-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: checkoutSessionId }),
            }).catch(() => {});
          }
          setDonationComplete(true);
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
  }, [
    preview,
    checkoutClientSecret,
    checkoutSessionId,
    apiBaseUrl,
    stripePublicKey,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (preview) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, campaign: campaignKey }),
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
      <div className="vvp-cd">
        <div className="vvp-cd__thanks">
          <strong>Danke für deine Unterstützung!</strong>
          <p>
            Deine Spende über {amount.toLocaleString("de-DE")} € wurde gezählt.
          </p>
          {certificateUrl && isSafeUrl(certificateUrl) && (
            <a
              className="vvp-cd__certificate"
              href={certificateUrl}
              target="_blank"
              rel="noreferrer"
            >
              Urkunde öffnen (PDF)
            </a>
          )}
        </div>
      </div>
    );
  }

  if (checkoutClientSecret) {
    return (
      <div className="vvp-cd">
        <div ref={checkoutContainerRef} className="vvp-cd__checkout" />
      </div>
    );
  }

  return (
    <div className="vvp-cd">
      <form className="vvp-cd__form" onSubmit={handleSubmit}>
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
        </div>
        <label className="vvp-cd__label" htmlFor="vvp-cd-custom">
          Eigener Betrag
        </label>
        <input
          id="vvp-cd-custom"
          className="vvp-cd__input"
          inputMode="decimal"
          placeholder="z. B. 35"
          value={customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
          aria-label="Eigener Betrag"
        />
        <button
          className="vvp-cd__submit"
          type="submit"
          disabled={loading || amount <= 0}
        >
          {loading ? "Lädt…" : "Jetzt spenden"}
        </button>
        {error && <p className="vvp-cd__error">{error}</p>}
      </form>
    </div>
  );
};
