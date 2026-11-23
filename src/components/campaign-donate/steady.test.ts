import { parseSteadyPlans, steadyPlanUrl } from "./steady";

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

  it("accepts commas as separators and surrounding whitespace", () => {
    expect(
      parseSteadyPlans(
        " 10 = a9ba3756-2501-4838-b157-04b9abca1635 , 25=eb744a98-4ae8-496b-848d-e4c090611bc8 ",
      ),
    ).toEqual([
      { amount: 10, planId: "a9ba3756-2501-4838-b157-04b9abca1635" },
      { amount: 25, planId: "eb744a98-4ae8-496b-848d-e4c090611bc8" },
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
