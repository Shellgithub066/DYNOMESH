import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CartPage } from "./pages/CartPage";
import {
  CheckoutBillingPage,
  CheckoutConfirmPage,
  CheckoutLayout,
  CheckoutPaymentPage,
  CheckoutReviewPage,
  CheckoutSuccessPage,
} from "./pages/CheckoutPages";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { DashboardPage } from "./pages/DashboardPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { MembershipPage } from "./pages/MembershipPage";
import { PublishGithubPage } from "./pages/PublishGithubPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UploadPage } from "./pages/UploadPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { useAuthStore } from "./store/authStore";
import { useCheckoutStore } from "./store/checkoutStore";
import { useMarketplaceStore } from "./store/marketplaceStore";

export default function App() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateMarket = useMarketplaceStore((s) => s.hydrate);
  const hydrateCheckout = useCheckoutStore((s) => s.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateMarket();
    hydrateCheckout();
  }, [hydrateAuth, hydrateMarket, hydrateCheckout]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="listing/:slug" element={<ListingDetailPage />} />
          <Route path="user/:username" element={<UserProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="publish/github" element={<PublishGithubPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutLayout />}>
            <Route index element={<CheckoutReviewPage />} />
            <Route path="billing" element={<CheckoutBillingPage />} />
            <Route path="payment" element={<CheckoutPaymentPage />} />
            <Route path="confirm" element={<CheckoutConfirmPage />} />
            <Route path="success/:orderId" element={<CheckoutSuccessPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
