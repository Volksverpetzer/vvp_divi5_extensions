/**
 * The donor's custom amount in whole euros, or 0 when it isn't a positive
 * whole number (the buttons are then disabled and a hint is shown). The
 * crowdfunding app takes whole euros, so "3,50" is rejected rather than
 * rounded to 4 €: the donor must never be charged an amount other than the
 * one they entered. German decimal commas are accepted, so "12,00" is 12.
 */
export const parseCustomAmount = (value: string): number => {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
};
