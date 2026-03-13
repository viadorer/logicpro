import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Detail from "./pages/Detail";
import KnowledgeBase from "./pages/KnowledgeBase";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminListings from "./pages/admin/AdminListings";
import AdminListingForm from "./pages/admin/AdminListingForm";
import AdminInquiries from "./pages/admin/AdminInquiries";

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes — no Header/Footer */}
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

      {/* Public routes with Header/Footer */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/nabidky" element={<PublicLayout><Listings /></PublicLayout>} />
      <Route path="/detail/:id" element={<PublicLayout><Detail /></PublicLayout>} />
      <Route path="/knowledge-base" element={<PublicLayout><KnowledgeBase /></PublicLayout>} />
      <Route path="/prihlaseni" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/registrace" element={<PublicLayout><Register /></PublicLayout>} />
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
    </Routes>
  );
}
