export type PayPalCaptureResponse = {
  captured?: boolean;
  recorded?: boolean;
  amount?: number;
  error?: string;
};

/**
 * Whether the donor's PayPal payment went through, based on the crowdfunding
 * app's /api/paypal-capture-order response. `captured` means PayPal took the
 * money; `recorded` only says the campaign total was updated, which can lag
 * behind when the crowdfunding database is briefly unreachable (its PayPal
 * webhook records the donation later). Showing an error in that case would
 * invite the donor to pay twice. `recorded` alone still counts, for
 * crowdfunding deployments from before `captured` existed.
 */
export const isPayPalCaptureSuccessful = (
  ok: boolean,
  json: PayPalCaptureResponse | null | undefined,
): boolean => ok && Boolean(json?.captured || json?.recorded);
