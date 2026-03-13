import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Prihlaseni se nezdarilo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth__card glass">
        <h1 className="auth__title">Prihlaseni</h1>
        <p className="auth__subtitle">Zadejte sve prihlasovaci udaje</p>
        <form className="auth__form" onSubmit={handleSubmit}>
          {error && <div className="auth__error">{error}</div>}
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
          <button
            type="submit"
            className="btn btn--fill btn--full"
            disabled={submitting}
          >
            {submitting ? "Prihlasuji..." : "Prihlasit se"}
          </button>
        </form>
        <p className="auth__link">
          Nemate ucet? <Link to="/registrace">Zaregistrujte se</Link>
        </p>
      </div>
    </section>
  );
}
