import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Detail from "./pages/Detail";
import KnowledgeBase from "./pages/KnowledgeBase";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nabidky" element={<Listings />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
      </Routes>
      <Footer />
    </>
  );
}
