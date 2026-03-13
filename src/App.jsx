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

export default function App() {
  return (
    <Routes>
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
      <Route
        path="*"
        element={
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/nabidky" element={<Listings />} />
              <Route path="/detail/:id" element={<Detail />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/prihlaseni" element={<Login />} />
              <Route path="/registrace" element={<Register />} />
              <Route
                path="/profil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Footer />
          </>
        }
      />
    </Routes>
  );
}
