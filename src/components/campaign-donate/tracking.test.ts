import { toPlausibleProps, trackDonateEvent } from "./tracking";

describe("toPlausibleProps", () => {
  it("turns values into strings and drops empty ones", () => {
    expect(
      toPlausibleProps({
        amount: 8,
        interval: "month",
        recorded: true,
        reason: undefined,
        error: null,
      }),
    ).toEqual({ amount: "8", interval: "month", recorded: "true" });
  });

  it("returns undefined when nothing is left", () => {
    expect(toPlausibleProps({ reason: undefined })).toBeUndefined();
  });
});

describe("trackDonateEvent", () => {
  afterEach(() => {
    delete window.plausible;
  });

  it("sends the event with campaign and interval to window.plausible", () => {
    const plausible = vi.fn();
    window.plausible = plausible;
    trackDonateEvent(
      "Steady",
      { campaign: "xmas2026", interval: "month" },
      { amount: 12 },
    );
    expect(plausible).toHaveBeenCalledWith("Steady", {
      props: { campaign: "xmas2026", interval: "month", amount: "12" },
    });
  });

  it("does nothing without the Plausible script", () => {
    expect(() =>
      trackDonateEvent("DonateConversion", {
        campaign: "xmas2026",
        interval: "once",
      }),
    ).not.toThrow();
  });
});
