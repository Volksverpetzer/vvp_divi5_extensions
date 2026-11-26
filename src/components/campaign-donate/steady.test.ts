import {
  formatSteadyAmounts,
  parseSteadyPlans,
  steadyPlanForAmount,
  steadyPlanUrl,
} from "./steady";

const xmasPlans = [
  { amount: 3, planId: "48fdfe83-af8b-462e-a56a-c4cfe647261f" },
  { amount: 8, planId: "7e829883-979d-4200-ba6e-8c0ffbffd151" },
  { amount: 12, planId: "01765082-40b1-4244-bbe6-f5311e99df7b" },
  { amount: 20, planId: "c3fd548d-de5c-4994-a454-95577647d346" },
  { amount: 30, planId: "7c881bbc-9c8f-46da-a0c4-2f36140ea446" },
];

describe("parseSteadyPlans", () => {
  it("parses one amount=plan-id entry per line", () => {
    expect(
      parseSteadyPlans(
        "3=955a79f3-ef31-4fc3-b196-2e634ed29f20\n5=a5fcfc59-8848-4359-9b03-585cfedb54b5",
      ),
    ).toEqual([
      { amount: 3, planId: "955a79f3-ef31-4fc3-b196-2e634ed29f20" },
      { amount: 5, planId: "a5fcfc59-8848-4359-9b03-585cfedb54b5" },
    ]);
  });

  it("accepts semicolons as separators and surrounding whitespace", () => {
    expect(
      parseSteadyPlans(
        " 10 = a9ba3756-2501-4838-b157-04b9abca1635 ; 25=eb744a98-4ae8-496b-848d-e4c090611bc8 ",
      ),
    ).toEqual([
      { amount: 10, planId: "a9ba3756-2501-4838-b157-04b9abca1635" },
      { amount: 25, planId: "eb744a98-4ae8-496b-848d-e4c090611bc8" },
    ]);
  });

  it("reads a German decimal comma as part of the amount", () => {
    expect(
      parseSteadyPlans(
        "3,50=955a79f3-ef31-4fc3-b196-2e634ed29f20\n7.5=a5fcfc59-8848-4359-9b03-585cfedb54b5",
      ),
    ).toEqual([
      { amount: 3.5, planId: "955a79f3-ef31-4fc3-b196-2e634ed29f20" },
      { amount: 7.5, planId: "a5fcfc59-8848-4359-9b03-585cfedb54b5" },
    ]);
  });

  it("skips entries with an invalid amount or plan ID", () => {
    expect(
      parseSteadyPlans(
        [
          "abc=955a79f3-ef31-4fc3-b196-2e634ed29f20",
          "0=955a79f3-ef31-4fc3-b196-2e634ed29f20",
          "5=not-a-plan-id",
          "5=javascript:alert(1)",
          "5",
          "",
        ].join("\n"),
      ),
    ).toEqual([]);
  });
});

describe("steadyPlanUrl", () => {
  it("links to the plan's Steady checkout", () => {
    expect(steadyPlanUrl("955a79f3-ef31-4fc3-b196-2e634ed29f20")).toBe(
      "https://steady.page/plans/955a79f3-ef31-4fc3-b196-2e634ed29f20",
    );
  });
});

describe("steadyPlanForAmount", () => {
  it("picks the plan matching the selected preset", () => {
    expect(steadyPlanForAmount(xmasPlans, 12, false)).toEqual(xmasPlans[2]);
  });

  it("has no plan for a preset without one", () => {
    expect(steadyPlanForAmount(xmasPlans, 50, false)).toBeUndefined();
  });

  it("has no plan for a custom amount, even one matching a plan", () => {
    expect(steadyPlanForAmount(xmasPlans, 8, true)).toBeUndefined();
  });
});

describe("formatSteadyAmounts", () => {
  it("lists the amounts with a German 'oder'", () => {
    expect(formatSteadyAmounts(xmasPlans)).toBe("3, 8, 12, 20 oder 30");
    expect(
      formatSteadyAmounts([{ amount: 3.5, planId: xmasPlans[0].planId }]),
    ).toBe("3,5");
    expect(formatSteadyAmounts([])).toBe("");
  });
});
