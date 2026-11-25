import { parseCustomAmount } from "./amount";

describe("parseCustomAmount", () => {
  it("accepts whole euros, with or without a decimal comma or dot", () => {
    expect(parseCustomAmount("35")).toBe(35);
    expect(parseCustomAmount(" 12 ")).toBe(12);
    expect(parseCustomAmount("12,00")).toBe(12);
    expect(parseCustomAmount("12.0")).toBe(12);
  });

  it("rejects fractional amounts instead of rounding them", () => {
    expect(parseCustomAmount("3,50")).toBe(0);
    expect(parseCustomAmount("12.5")).toBe(0);
  });

  it("rejects empty, non-numeric, zero and negative input", () => {
    expect(parseCustomAmount("")).toBe(0);
    expect(parseCustomAmount("abc")).toBe(0);
    expect(parseCustomAmount("0")).toBe(0);
    expect(parseCustomAmount("-5")).toBe(0);
  });
});
