import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CampaignDonateApp } from "./App";

// No network in tests: the form loads Stripe.js on mount.
vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

describe("CampaignDonateApp A/B test", () => {
  afterEach(() => {
    delete window.plausible;
  });

  const props = {
    apiBaseUrl: "https://crowdfunding.example",
    campaignKey: "xmas2026",
    stripePublicKey: "pk_test_123",
    paypalClientId: "",
    presets: [10, 50, 100],
  };

  it("shows the default label without a test", () => {
    render(<CampaignDonateApp {...props} />);
    expect(
      screen.getByRole("button", { name: "Mit Karte/SEPA spenden" }),
    ).toBeTruthy();
  });

  it("shows the variant's label and tags events with the test", () => {
    const plausible = vi.fn();
    window.plausible = plausible;
    render(
      <CampaignDonateApp
        {...props}
        buttonLabel="Jetzt helfen"
        experiment={{ name: "button-xmas2026", variant: "B" }}
      />,
    );
    expect(screen.getByRole("button", { name: "Jetzt helfen" })).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: /100/ }));
    expect(plausible).toHaveBeenCalledWith("Donation Option Selected", {
      props: expect.objectContaining({
        campaign: "xmas2026",
        experiment: "button-xmas2026",
        variant: "B",
        amount: "100",
      }),
    });
  });
});
