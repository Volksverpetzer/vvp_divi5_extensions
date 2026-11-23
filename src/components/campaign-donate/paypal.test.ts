import { isPayPalCaptureSuccessful } from "./paypal";

describe("isPayPalCaptureSuccessful", () => {
  it("succeeds when the payment was captured and recorded", () => {
    expect(
      isPayPalCaptureSuccessful(true, { captured: true, recorded: true }),
    ).toBe(true);
  });

  it("succeeds when the payment was captured but not yet recorded", () => {
    expect(
      isPayPalCaptureSuccessful(true, { captured: true, recorded: false }),
    ).toBe(true);
  });

  it("succeeds on the older response shape without `captured`", () => {
    expect(isPayPalCaptureSuccessful(true, { recorded: true })).toBe(true);
  });

  it("fails when neither captured nor recorded", () => {
    expect(isPayPalCaptureSuccessful(true, { recorded: false })).toBe(false);
    expect(isPayPalCaptureSuccessful(true, null)).toBe(false);
  });

  it("fails on an error status, whatever the body says", () => {
    expect(
      isPayPalCaptureSuccessful(false, {
        captured: true,
        error: "Konnte Zahlung nicht abschließen.",
      }),
    ).toBe(false);
  });
});
