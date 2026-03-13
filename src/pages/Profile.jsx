import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [loadingSearches, setLoadingSearches] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("favorites")
      .select("listing_id, listings(*)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setFavorites(
          (data || []).map((f) => f.listings).filter(Boolean)
        );
        setLoadingFavs(false);
      });

    supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSavedSearches(data || []);
        setLoadingSearches(false);
      });
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  async function deleteSearch(id) {
    await supabase.from("saved_searches").delete().eq("id", id);
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }

  function applySearch(search) {
    const params = new URLSearchParams(search.filters || {});
    navigate(`/nabidky?${params.toString()}`);
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "Uzivatel";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="profile">
      <div className="wrap">
        <div className="profile__header">
          <div className="profile__avatar">{initials}</div>
          <div>
            <div className="profile__name">{displayName}</div>
            <div className="profile__email">{user?.email}</div>
          </div>
        </div>

        <div className="profile__section">
          <h2>Oblibene nemovitosti</h2>
          {loadingFavs ? (
            <div className="loader">
              <div className="loader__spinner" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="profile__empty">
              Zatim nemáte zadne oblibene nemovitosti.
            </div>
          ) : (
            <div className="listings__grid">
              {favorites.map((l) => (
                <Card key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>

        <div className="profile__section">
          <h2>Ulozena hledani</h2>
          {loadingSearches ? (
            <div className="loader">
              <div className="loader__spinner" />
            </div>
          ) : savedSearches.length === 0 ? (
            <div className="profile__empty">
              Zatim nemáte zadna ulozena hledani.
            </div>
          ) : (
            <div className="profile__searches">
              {savedSearches.map((s) => (
                <div key={s.id} className="saved-search">
                  <div>
                    <div className="saved-search__name">{s.name}</div>
                    <div className="saved-search__date">
                      {new Date(s.created_at).toLocaleDateString("cs-CZ")}
                    </div>
                  </div>
                  <div className="saved-search__actions">
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => applySearch(s)}
                    >
                      Pouzit
                    </button>
                    <button
                      className="saved-search__del"
                      onClick={() => deleteSearch(s.id)}
                      title="Smazat"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn--outline" onClick={handleSignOut}>
          Odhlasit se
        </button>
      </div>
    </section>
  );
}
