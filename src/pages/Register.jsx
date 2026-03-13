import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Hesla se neshoduji.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registrace se nezdarila.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth__card glass">
        <h1 className="auth__title">Registrace</h1>
        <p className="auth__subtitle">Vytvorte si novy ucet</p>
        {success ? (
          <div className="auth__success">
            Registrace uspesna. Zkontrolujte svuj email.
          </div>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit}>
            {error && <div className="auth__error">{error}</div>}
            <input
              className="auth__input"
              type="text"
              placeholder="Cele jmeno"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className="auth__input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="auth__input"
              type="password"
              placeholder="Heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className="auth__input"
              type="password"
              placeholder="Potvrzeni hesla"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn--fill btn--full"
              disabled={submitting}
            >
              {submitting ? "Registruji..." : "Zaregistrovat se"}
            </button>
          </form>
        )}
        <p className="auth__link">
          Mate ucet? <Link to="/prihlaseni">Prihlaste se</Link>
        </p>
      </div>
    </section>
  );
}
