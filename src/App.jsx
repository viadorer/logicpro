import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Tezsi stranky split-load
const Listings = lazy(() => import("./pages/Listings"));
const Detail = lazy(() => import("./pages/Detail"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminListings = lazy(() => import("./pages/admin/AdminListings"));
const AdminListingForm = lazy(() => import("./pages/admin/AdminListingForm"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function PageLoader() {
  return (
    <div style={{ padding: "200px 0", textAlign: "center" }}>
      <div className="loader"><div className="loader__spinner" /></div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin routes — bez Header/Footer */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminListings />} />
            <Route path="inzerat/novy" element={<AdminListingForm />} />
            <Route path="inzerat/:id" element={<AdminListingForm />} />
            <Route path="poptavky" element={<AdminInquiries />} />
          </Route>

          {/* Verejne stranky s Header/Footer */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/nabidky" element={<PublicLayout><Listings /></PublicLayout>} />
          <Route path="/detail/:id" element={<PublicLayout><Detail /></PublicLayout>} />
          <Route path="/knowledge-base" element={<PublicLayout><KnowledgeBase /></PublicLayout>} />
          <Route path="/prihlaseni" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/registrace" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/zapomenute-heslo" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          <Route path="/reset-hesla" element={<PublicLayout><ResetPassword /></PublicLayout>} />
          <Route path="/ochrana-osobnich-udaju" element={<PublicLayout><Privacy /></PublicLayout>} />
          <Route path="/obchodni-podminky" element={<PublicLayout><Terms /></PublicLayout>} />
          <Route
            path="/profil"
            element={
              <PublicLayout>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </PublicLayout>
            }
          />
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </Suspense>
      <CookieBanner />
    </>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "200px 20px", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32 }}>Stránka nenalezena</h1>
      <p style={{ color: "#666", marginTop: 12 }}>Hledaná adresa neexistuje nebo byla přesunuta.</p>
      <a href="/" className="btn btn--fill btn--sm" style={{ marginTop: 24, display: "inline-block" }}>Zpět na úvod</a>
    </div>
  );
}
