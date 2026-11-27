import {
  DEFAULT_STRIPE_BUTTON_LABEL,
  normalizeApiBaseUrl,
  resolveButtonLabel,
  resolveMountSettings,
  type MountSettings,
} from "./mount-config";

const plans = [{ amount: 5, planId: "a5fcfc59-8848-4359-9b03-585cfedb54b5" }];

const base: MountSettings = {
  apiBaseUrl: "https://crowdfunding.volksverpetzer.de",
  campaignKey: "xmas2026",
  interval: "once",
  stripePublicKey: "pk_test_123",
  paypalClientId: "paypal-id",
  steadyPlans: plans,
};

describe("resolveMountSettings", () => {
  it("one-time: offers Stripe and PayPal, no Steady", () => {
    const resolved = resolveMountSettings(base);
    expect(resolved?.stripePublicKey).toBe("pk_test_123");
    expect(resolved?.paypalClientId).toBe("paypal-id");
    expect(resolved?.steadyPlans).toEqual([]);
  });

  it("monthly: offers Stripe and Steady, hides PayPal", () => {
    const resolved = resolveMountSettings({ ...base, interval: "month" });
    expect(resolved?.stripePublicKey).toBe("pk_test_123");
    expect(resolved?.paypalClientId).toBe("");
    expect(resolved?.steadyPlans).toEqual(plans);
  });

  it("monthly with only Steady plans renders without any API settings", () => {
    const resolved = resolveMountSettings({
      ...base,
      interval: "month",
      apiBaseUrl: "",
      campaignKey: "",
      stripePublicKey: "",
      paypalClientId: "",
    });
    expect(resolved).not.toBeNull();
    expect(resolved?.steadyPlans).toEqual(plans);
  });

  it("drops Stripe and PayPal when the API settings are missing", () => {
    const resolved = resolveMountSettings({
      ...base,
      interval: "month",
      campaignKey: "",
    });
    expect(resolved?.stripePublicKey).toBe("");
    expect(resolved?.steadyPlans).toEqual(plans);
  });

  it("renders nothing without any usable payment option", () => {
    expect(resolveMountSettings({ ...base, apiBaseUrl: "" })).toBeNull();
    expect(
      resolveMountSettings({
        ...base,
        interval: "month",
        steadyPlans: [],
        stripePublicKey: "",
      }),
    ).toBeNull();
  });
});

describe("normalizeApiBaseUrl", () => {
  const root = "https://crowdfunding.volksverpetzer.de";

  it.each([
    [root, root],
    [`${root}/`, root],
    [`  ${root}//  `, root],
    [`${root}/api`, root],
    [`${root}/api/`, root],
    [`${root}/api/campaign-summary`, root],
    [`${root}/api/campaign-summary/`, root],
    [`${root}/api/campaign-summary?campaign=xmas2026`, root],
    [`${root}/api/create-checkout-session`, root],
    [`${root}/spenden`, `${root}/spenden`],
    [`${root}/spenden/api/campaign-summary`, `${root}/spenden`],
    [`${root}/api-docs`, `${root}/api-docs`],
    ["", ""],
  ])("%s -> %s", (input, expected) => {
    expect(normalizeApiBaseUrl(input)).toBe(expected);
  });

  it("is applied by resolveMountSettings", () => {
    const resolved = resolveMountSettings({
      ...base,
      apiBaseUrl: `${root}/api/campaign-summary`,
    });
    expect(resolved?.apiBaseUrl).toBe(root);
  });
});

describe("resolveButtonLabel", () => {
  const settings = {
    buttonLabel: "",
    testName: "",
    buttonLabelB: "",
    hasStripe: true,
  };
  const pickB = vi.fn(() => "B" as const);
  const pickA = () => "A" as const;

  it("uses the default label without a test", () => {
    expect(resolveButtonLabel(settings, pickB)).toEqual({
      buttonLabel: DEFAULT_STRIPE_BUTTON_LABEL,
    });
    expect(pickB).not.toHaveBeenCalled();
  });

  it("uses the configured label", () => {
    expect(
      resolveButtonLabel({ ...settings, buttonLabel: " Jetzt spenden " }, pickB)
        .buttonLabel,
    ).toBe("Jetzt spenden");
  });

  it.each([
    ["no name", { buttonLabelB: "Jetzt helfen" }],
    ["no variant B label", { testName: "btn-xmas" }],
    [
      "no Stripe button",
      { testName: "btn-xmas", buttonLabelB: "Jetzt helfen", hasStripe: false },
    ],
  ])("runs no test with %s", (_, overrides) => {
    expect(resolveButtonLabel({ ...settings, ...overrides }, pickB)).toEqual({
      buttonLabel: DEFAULT_STRIPE_BUTTON_LABEL,
    });
  });

  it("shows variant B's label in variant B", () => {
    expect(
      resolveButtonLabel(
        { ...settings, testName: " btn-xmas ", buttonLabelB: "Jetzt helfen" },
        pickB,
      ),
    ).toEqual({
      buttonLabel: "Jetzt helfen",
      experiment: { name: "btn-xmas", variant: "B" },
    });
    expect(pickB).toHaveBeenCalledWith("btn-xmas");
  });

  it("shows the regular label in variant A", () => {
    expect(
      resolveButtonLabel(
        {
          ...settings,
          buttonLabel: "Jetzt spenden",
          testName: "btn-xmas",
          buttonLabelB: "Jetzt helfen",
        },
        pickA,
      ),
    ).toEqual({
      buttonLabel: "Jetzt spenden",
      experiment: { name: "btn-xmas", variant: "A" },
    });
  });
});
