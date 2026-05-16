import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase posila uzivatele zpet s ?type=recovery v URL hash;
    // klient pak ma docasnou session, ktera dovoli zavolat updateUser.
    if (!supabase) {
      setError("Autentizace neni nakonfigurovana.");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Pokud je uz session aktivni (refresh stranky), povolime formular.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků.");
      return;
    }
    if (password !== confirm) {
      setError("Hesla se neshodují.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => navigate("/prihlaseni"), 2500);
    } catch (err) {
      setError(err.message || "Změna hesla se nezdařila.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth__card glass">
        <h1 className="auth__title">Nastavit nové heslo</h1>
        {success ? (
          <div className="inquiry__success" style={{ marginTop: 16 }}>
            <strong>Heslo bylo změněno.</strong>
            <br />
            Za chvíli vás přesměrujeme na přihlášení.
          </div>
        ) : !ready ? (
          <p className="auth__subtitle">
            Načítám obnovovací odkaz. Pokud nic nepřijde do 5 sekund, požádejte o nový odkaz na{" "}
            <Link to="/zapomenute-heslo">/zapomenute-heslo</Link>.
          </p>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit}>
            {error && <div className="auth__error">{error}</div>}
            <input
              className="auth__input"
              type="password"
              placeholder="Nové heslo (min. 8 znaků)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
            <input
              className="auth__input"
              type="password"
              placeholder="Heslo znovu"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
            <button
              type="submit"
              className="btn btn--fill btn--full"
              disabled={submitting}
            >
              {submitting ? "Ukládám..." : "Nastavit heslo"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
