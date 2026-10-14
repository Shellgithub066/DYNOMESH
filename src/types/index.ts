export type AssetKind =
  | "physics"
  | "urdf"
  | "controller"
  | "simulation"
  | "dataset";

export type LicenseType = "MIT" | "Apache-2.0" | "Commercial" | "CC-BY-4.0";

export type MembershipPlan = "free" | "pro" | "lab";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  createdAt: string;
  membershipPlan: MembershipPlan;
  githubUsername?: string;
  githubConnected: boolean;
  authProvider: "email" | "github";
}

export interface Listing {
  id: string;
  slug: string;
  ownerId: string;
  ownerUsername: string;
  title: string;
  description: string;
  kind: AssetKind;
  tags: string[];
  priceUsd: number;
  license: LicenseType;
  downloads: number;
  likes: number;
  version: string;
  fileSizeMb: number;
  simulatorTags: string[];
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  githubRepoUrl?: string;
  githubDefaultBranch?: string;
  githubStars?: number;
}

export interface CartItem {
  listingId: string;
  addedAt: string;
}

export type OrderStatus = "paid" | "refunded";
export type PaymentMethod = "card";

export interface OrderBillingSnapshot {
  fullName: string;
  email: string;
  line1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  buyerId: string;
  listingIds: string[];
  totalUsd: number;
  createdAt: string;
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  cardLast4?: string;
  cardBrand?: string;
  billing?: OrderBillingSnapshot;
}

export interface CheckoutPaymentMeta {
  method: PaymentMethod;
  cardLast4: string;
  cardBrand: string;
  billing: OrderBillingSnapshot;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  displayName: string;
  membershipPlan: MembershipPlan;
}

export interface LoginInput {
  email: string;
  password: string;
}
