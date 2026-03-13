import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function FavoriteButton({ listingId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle()
      .then(({ data }) => {
        setFavorited(!!data);
      });
  }, [user, listingId]);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/prihlaseni");
      return;
    }

    if (busy || !supabase) return;
    setBusy(true);

    try {
      if (favorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);
        setFavorited(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: listingId });
        setFavorited(true);
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`fav-btn${favorited ? " fav-btn--active" : ""}`}
      onClick={handleClick}
      title={favorited ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
