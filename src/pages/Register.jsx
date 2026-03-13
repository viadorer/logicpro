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
      setError("Hesla se neshodují.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registrace se nezdařila.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth__card glass">
        <h1 className="auth__title">Registrace</h1>
        <p className="auth__subtitle">Vytvořte si nový účet</p>
        {success ? (
          <div className="auth__success">
            Registrace úspěšná. Zkontrolujte svůj email.
          </div>
        ) : (
          <form className="auth__form" onSubmit={handleSubmit}>
            {error && <div className="auth__error">{error}</div>}
            <input
              className="auth__input"
              type="text"
              placeholder="Celé jméno"
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
              placeholder="Potvrzení hesla"
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
          Máte účet? <Link to="/prihlaseni">Přihlaste se</Link>
        </p>
      </div>
    </section>
  );
}
