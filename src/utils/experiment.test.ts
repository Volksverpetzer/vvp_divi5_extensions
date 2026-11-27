import { assignVariant, type Variant } from "./experiment";

describe("assignVariant", () => {
  it("picks A below 0.5 and B from 0.5", () => {
    expect(assignVariant("t", new Map(), () => 0.49)).toBe("A");
    expect(assignVariant("t", new Map(), () => 0.5)).toBe("B");
  });

  it("keeps the variant of a test within one page view", () => {
    const assignments = new Map<string, Variant>();
    const random = vi.fn().mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    expect(assignVariant("btn", assignments, random)).toBe("B");
    expect(assignVariant("btn", assignments, random)).toBe("B");
    expect(random).toHaveBeenCalledTimes(1);
  });

  it("picks separately for different tests", () => {
    const assignments = new Map<string, Variant>();
    const random = vi.fn().mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    expect(assignVariant("one", assignments, random)).toBe("B");
    expect(assignVariant("two", assignments, random)).toBe("A");
  });

  it("splits roughly 50/50", () => {
    let b = 0;
    for (let i = 0; i < 10000; i++) {
      if (assignVariant(String(i), new Map()) === "B") b++;
    }
    expect(b).toBeGreaterThan(4700);
    expect(b).toBeLessThan(5300);
  });
});
