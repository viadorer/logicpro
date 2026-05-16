import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!supabase) throw new Error("Autentizace neni nakonfigurovana.");
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-hesla`,
      });
      if (err) throw err;
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Odeslání odkazu se nezdařilo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth__card glass">
        <h1 className="auth__title">Zapomenuté heslo</h1>
        <p className="auth__subtitle">
          Zadejte e-mail a pošleme vám odkaz pro obnovu hesla.
        </p>
        {success ? (
          <div className="inquiry__success" style={{ marginTop: 16 }}>
            <strong>Odkaz byl odeslán.</strong>
            <br />
            Zkontrolujte si schránku (a případně složku Spam).
          </div>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit}>
            {error && <div className="auth__error">{error}</div>}
            <input
              className="auth__input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <button
              type="submit"
              className="btn btn--fill btn--full"
              disabled={submitting}
            >
              {submitting ? "Odesílám..." : "Poslat odkaz"}
            </button>
          </form>
        )}
        <p className="auth__link">
          <Link to="/prihlaseni">Zpět na přihlášení</Link>
        </p>
      </div>
    </section>
  );
}
