import { Route, Routes } from "react-router-dom";
import { RequireAdmin, RequireAuth, RequireStaff } from "@/components/protected-route";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MainLayout } from "@/layouts/MainLayout";
import AccountPage from "@/pages/AccountPage";
import CartPage from "@/pages/CartPage";
import CataloguePage from "@/pages/CataloguePage";
import CheckoutPage from "@/pages/CheckoutPage";
import ConfirmationPage from "@/pages/ConfirmationPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import LookupPage from "@/pages/LookupPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import DashboardInventoryPage from "@/pages/dashboard/InventoryPage";
import DashboardOrdersPage from "@/pages/dashboard/OrdersPage";
import DashboardProductsPage from "@/pages/dashboard/ProductsPage";
import DashboardSettingsPage from "@/pages/dashboard/SettingsPage";
import DashboardUsersPage from "@/pages/dashboard/UsersPage";

/**
 * Route table. The storefront and the dashboard are separate layout branches.
 *
 * `RequireStaff` covers the dashboard as a whole; `RequireAdmin` narrows the
 * catalogue and team screens inside it. Both are navigation aids — the API
 * enforces the same split with `requireRole` on every route.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<CataloguePage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders/confirmation/:reference" element={<ConfirmationPage />} />
        <Route path="orders/lookup" element={<LookupPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="dashboard"
        element={
          <RequireStaff>
            <AdminLayout />
          </RequireStaff>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<DashboardOrdersPage />} />
        <Route path="inventory" element={<DashboardInventoryPage />} />
        <Route
          path="products"
          element={
            <RequireAdmin>
              <DashboardProductsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="users"
          element={
            <RequireAdmin>
              <DashboardUsersPage />
            </RequireAdmin>
          }
        />
        <Route
          path="settings"
          element={
            <RequireAdmin>
              <DashboardSettingsPage />
            </RequireAdmin>
          }
        />
      </Route>
    </Routes>
  );
}
