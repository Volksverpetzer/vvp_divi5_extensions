import {
  assignVariant,
  experimentToParam,
  variantFromParam,
  type Variant,
} from "./experiment";

describe("assignVariant", () => {
  it("picks A below 0.5 and B from 0.5", () => {
    expect(assignVariant("t", undefined, new Map(), () => 0.49)).toBe("A");
    expect(assignVariant("t", undefined, new Map(), () => 0.5)).toBe("B");
  });

  it("keeps the variant of a test within one page view", () => {
    const assignments = new Map<string, Variant>();
    const random = vi.fn().mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    expect(assignVariant("btn", undefined, assignments, random)).toBe("B");
    expect(assignVariant("btn", undefined, assignments, random)).toBe("B");
    expect(random).toHaveBeenCalledTimes(1);
  });

  it("picks separately for different tests", () => {
    const assignments = new Map<string, Variant>();
    const random = vi.fn().mockReturnValueOnce(0.9).mockReturnValueOnce(0.1);
    expect(assignVariant("one", undefined, assignments, random)).toBe("B");
    expect(assignVariant("two", undefined, assignments, random)).toBe("A");
  });

  it("splits roughly 50/50", () => {
    let b = 0;
    for (let i = 0; i < 10000; i++) {
      if (assignVariant(String(i), undefined, new Map()) === "B") b++;
    }
    expect(b).toBeGreaterThan(4700);
    expect(b).toBeLessThan(5300);
  });
});

describe("carried variants", () => {
  it("uses the carried variant instead of a random pick", () => {
    const assignments = new Map<string, Variant>();
    const random = vi.fn(() => 0.9);
    expect(assignVariant("btn", "A", assignments, random)).toBe("A");
    expect(assignVariant("btn", undefined, assignments, random)).toBe("A");
    expect(random).not.toHaveBeenCalled();
  });

  it("round-trips through the URL parameter", () => {
    const param = experimentToParam({ name: "button:xmas", variant: "B" });
    expect(variantFromParam(param, "button:xmas")).toBe("B");
  });

  it.each([
    [null, "btn"],
    ["", "btn"],
    ["btn", "btn"],
    ["other:A", "btn"],
    ["btn:C", "btn"],
  ])("ignores %j for test %s", (value, name) => {
    expect(variantFromParam(value, name)).toBeUndefined();
  });
});
