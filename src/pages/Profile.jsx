import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const [loadingSearches, setLoadingSearches] = useState(true);

  // Profile edit form
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setEditName(profile?.full_name || "");
    setEditPhone(profile?.phone || "");
  }, [profile?.full_name, profile?.phone]);

  useEffect(() => {
    if (!user || !supabase) return;

    supabase
      .from("favorites")
      .select("listing_id, listings(*, listing_images!left(url, is_main))")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const items = (data || [])
          .map((f) => {
            const l = f.listings;
            if (!l) return null;
            const mainImg = l.listing_images?.find((i) => i.is_main === 1);
            return {
              ...l,
              main_image: mainImg?.url || l.listing_images?.[0]?.url || null,
              listing_images: undefined,
            };
          })
          .filter(Boolean);
        setFavorites(items);
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

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName.trim() || null,
          phone: editPhone.trim() || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile?.();
      setEditMode(false);
    } catch (err) {
      setSaveError(err.message || "Uložení se nezdařilo.");
    } finally {
      setSaving(false);
    }
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "Uživatel";
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
          <div style={{ flex: 1 }}>
            <div className="profile__name">{displayName}</div>
            <div className="profile__email">{user?.email}</div>
            {profile?.phone && (
              <div className="profile__email" style={{ marginTop: 4 }}>{profile.phone}</div>
            )}
          </div>
          {!editMode && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setEditMode(true)}
            >
              Upravit profil
            </button>
          )}
        </div>

        {editMode && (
          <div className="profile__section">
            <h2>Upravit profil</h2>
            <form onSubmit={handleSaveProfile} className="auth__form" style={{ maxWidth: 480 }}>
              {saveError && <div className="auth__error">{saveError}</div>}
              <input
                className="auth__input"
                type="text"
                placeholder="Celé jméno"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoComplete="name"
              />
              <input
                className="auth__input"
                type="tel"
                placeholder="Telefon (nepovinné)"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                autoComplete="tel"
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="btn btn--fill btn--sm"
                  disabled={saving}
                >
                  {saving ? "Ukládám..." : "Uložit"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="profile__section">
          <h2>Oblíbené nemovitosti</h2>
          {loadingFavs ? (
            <div className="loader">
              <div className="loader__spinner" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="profile__empty">
              Zatím nemáte žádné oblíbené nemovitosti.
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
          <h2>Uložená hledání</h2>
          {loadingSearches ? (
            <div className="loader">
              <div className="loader__spinner" />
            </div>
          ) : savedSearches.length === 0 ? (
            <div className="profile__empty">
              Zatím nemáte žádná uložená hledání.
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
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => applySearch(s)}
                    >
                      Použít
                    </button>
                    <button
                      type="button"
                      className="saved-search__del"
                      onClick={() => deleteSearch(s.id)}
                      title="Smazat"
                      aria-label="Smazat uložené hledání"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="btn btn--outline" onClick={handleSignOut}>
          Odhlásit se
        </button>
      </div>
    </section>
  );
}
