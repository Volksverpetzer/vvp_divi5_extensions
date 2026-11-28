import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("carries the variant through the Stripe return URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: "test" }), { status: 400 }),
      );
    try {
      render(
        <CampaignDonateApp
          {...props}
          buttonLabel="Jetzt helfen"
          experiment={{ name: "button-xmas2026", variant: "B" }}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Jetzt helfen" }));
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      const [, init] = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      const { returnUrl } = JSON.parse(init.body as string);
      expect(returnUrl).toContain(
        "vvp_cd_ab=button-xmas2026%3AB&vvp_cd_session_id={CHECKOUT_SESSION_ID}",
      );
    } finally {
      fetchMock.mockRestore();
    }
  });

  describe("after a Stripe return", () => {
    const failedReturn = async (search: string) => {
      const plausible = vi.fn();
      window.plausible = plausible;
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(JSON.stringify({ recorded: false, error: "nope" })),
        );
      window.history.replaceState(null, "", `/weihnachten/${search}`);
      try {
        render(
          <CampaignDonateApp
            {...props}
            buttonLabel="Jetzt helfen"
            experiment={{ name: "header-test", variant: "A" }}
          />,
        );
        await waitFor(() =>
          expect(plausible).toHaveBeenCalledWith(
            "Checkout Failed",
            expect.anything(),
          ),
        );
        return plausible.mock.calls.find(
          ([event]) => event === "Checkout Failed",
        )?.[1]?.props;
      } finally {
        fetchMock.mockRestore();
        window.history.replaceState(null, "", "/");
      }
    };

    it("counts for the test carried in the return URL, not this form's", async () => {
      const eventProps = await failedReturn(
        "?vvp_cd_ab=footer-test%3AB&vvp_cd_session_id=cs_1",
      );
      expect(eventProps).toMatchObject({
        experiment: "footer-test",
        variant: "B",
      });
      expect(window.location.search).toBe("");
    });

    it("counts for no test when the return URL carries none", async () => {
      const eventProps = await failedReturn("?vvp_cd_session_id=cs_1");
      expect(eventProps).not.toHaveProperty("experiment");
      expect(eventProps).not.toHaveProperty("variant");
    });
  });
});
