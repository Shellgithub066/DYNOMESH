import { create } from "zustand";
import { loadJson, saveJson } from "./storage";

export interface CheckoutBilling {
  fullName: string;
  email: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutPaymentDraft {
  method: "card";
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cardLast4: string;
  cardBrand: string;
}

interface CheckoutState {
  billing: CheckoutBilling | null;
  payment: CheckoutPaymentDraft | null;
  setBilling: (billing: CheckoutBilling) => void;
  setPayment: (payment: CheckoutPaymentDraft) => void;
  clear: () => void;
  hydrate: () => void;
}

export function detectCardBrand(digits: string): string {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  if (digits.startsWith("34") || digits.startsWith("37")) return "Amex";
  return "Card";
}

export function parseCardDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function validateCardNumber(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  billing: null,
  payment: null,

  hydrate: () => {
    const billing = loadJson<CheckoutBilling | null>("checkoutBilling", null);
    const payment = loadJson<CheckoutPaymentDraft | null>("checkoutPayment", null);
    set({ billing, payment });
  },

  setBilling: (billing) => {
    saveJson("checkoutBilling", billing);
    set({ billing });
  },

  setPayment: (payment) => {
    saveJson("checkoutPayment", payment);
    set({ payment });
  },

  clear: () => {
    saveJson("checkoutBilling", null);
    saveJson("checkoutPayment", null);
    set({ billing: null, payment: null });
  },
}));
