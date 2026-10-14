import { create } from "zustand";
import { SEED_LISTINGS } from "../data/seedListings";
import type {
  AssetKind,
  CartItem,
  CheckoutPaymentMeta,
  Listing,
  Order,
} from "../types";
import { loadJson, saveJson } from "./storage";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** listingId -> userIds who liked (one like per account, persisted) */
type ListingLikesMap = Record<string, string[]>;

function applyLikeCounts(
  listings: Listing[],
  listingLikes: ListingLikesMap,
): Listing[] {
  return listings.map((l) => ({
    ...l,
    likes: listingLikes[l.id]?.length ?? 0,
  }));
}

interface MarketplaceState {
  listings: Listing[];
  listingLikes: ListingLikesMap;
  cart: CartItem[];
  orders: Order[];
  hydrate: () => void;
  userHasLiked: (listingId: string, userId: string | undefined) => boolean;
  addListing: (
    ownerId: string,
    ownerUsername: string,
    data: Omit<
      Listing,
      | "id"
      | "slug"
      | "ownerId"
      | "ownerUsername"
      | "downloads"
      | "likes"
      | "createdAt"
      | "updatedAt"
    >,
  ) => Listing;
  toggleLike: (
    listingId: string,
    userId: string | undefined,
  ) => { ok: true } | { ok: false; error: string };
  addToCart: (listingId: string) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  checkout: (buyerId: string, payment: CheckoutPaymentMeta) => Order | null;
  getOrder: (orderId: string) => Order | undefined;
  search: (query: string, kind?: AssetKind | "all") => Listing[];
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: [],
  listingLikes: {},
  cart: [],
  orders: [],

  hydrate: () => {
    const listingLikes = loadJson<ListingLikesMap>("listingLikes", {});
    const rawListings = loadJson<Listing[]>("listings", SEED_LISTINGS);
    const listings = applyLikeCounts(rawListings, listingLikes).map((l) => ({
      ...l,
      downloads: 0,
    }));
    saveJson("listings", listings);
    const cart = loadJson<CartItem[]>("cart", []);
    const orders = loadJson<Order[]>("orders", []);
    set({ listings, listingLikes, cart, orders });
  },

  userHasLiked: (listingId, userId) => {
    if (!userId) return false;
    return get().listingLikes[listingId]?.includes(userId) ?? false;
  },

  addListing: (ownerId, ownerUsername, data) => {
    const now = new Date().toISOString();
    const listing: Listing = {
      ...data,
      id: `lst_${crypto.randomUUID().slice(0, 8)}`,
      slug: `${slugify(data.title)}-${Date.now().toString(36)}`,
      ownerId,
      ownerUsername,
      downloads: 0,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };
    const listings = [listing, ...get().listings];
    saveJson("listings", listings);
    set({ listings });
    return listing;
  },

  toggleLike: (listingId, userId) => {
    if (!userId) {
      return { ok: false, error: "Log in to like this asset." };
    }
    const listing = get().listings.find((l) => l.id === listingId);
    if (!listing) {
      return { ok: false, error: "Listing not found." };
    }
    if (listing.ownerId === userId) {
      return { ok: false, error: "You cannot like your own listing." };
    }

    const listingLikes = { ...get().listingLikes };
    const current = new Set(listingLikes[listingId] ?? []);
    if (current.has(userId)) current.delete(userId);
    else current.add(userId);
    listingLikes[listingId] = [...current];

    const listings = applyLikeCounts(get().listings, listingLikes);
    saveJson("listingLikes", listingLikes);
    saveJson("listings", listings);
    set({ listingLikes, listings });
    return { ok: true };
  },

  addToCart: (listingId) => {
    if (get().cart.some((c) => c.listingId === listingId)) return;
    const cart = [
      ...get().cart,
      { listingId, addedAt: new Date().toISOString() },
    ];
    saveJson("cart", cart);
    set({ cart });
  },

  removeFromCart: (listingId) => {
    const cart = get().cart.filter((c) => c.listingId !== listingId);
    saveJson("cart", cart);
    set({ cart });
  },

  clearCart: () => {
    saveJson("cart", []);
    set({ cart: [] });
  },

  checkout: (buyerId, payment) => {
    const cart = get().cart;
    if (!cart.length) return null;
    const listingIds = cart.map((c) => c.listingId);
    const items = get().listings.filter((l) => listingIds.includes(l.id));
    const subtotal = items.reduce((s, l) => s + l.priceUsd, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalUsd = Math.round((subtotal + tax) * 100) / 100;
    const order: Order = {
      id: `ord_${crypto.randomUUID().slice(0, 8)}`,
      buyerId,
      listingIds,
      totalUsd,
      createdAt: new Date().toISOString(),
      status: "paid",
      paymentMethod: payment.method,
      cardLast4: payment.cardLast4,
      cardBrand: payment.cardBrand,
      billing: payment.billing,
    };
    const orders = [order, ...get().orders];
    saveJson("orders", orders);
    saveJson("cart", []);
    set({ orders, cart: [] });
    return order;
  },

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),

  search: (query, kind = "all") => {
    const q = query.trim().toLowerCase();
    return get().listings.filter((l) => {
      if (kind !== "all" && l.kind !== kind) return false;
      if (!q) return true;
      const hay = [
        l.title,
        l.description,
        l.ownerUsername,
        ...l.tags,
        ...l.simulatorTags,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  },
}));
