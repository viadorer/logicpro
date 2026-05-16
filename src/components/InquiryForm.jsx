import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Turnstile from "./Turnstile";

export default function InquiryForm({ listing }) {
  const { user, profile } = useAuth();

  const [name, setName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    listing ? `Mám zájem o: ${listing.title}` : ""
  );
  const [website, setWebsite] = useState(""); // honeypot
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback((token) => {
    setTurnstileToken(token || "");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const r = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing?.id || null,
          name,
          email,
          phone: phone || null,
          message,
          website, // honeypot — pravy uzivatel ho nevyplni
          turnstile_token: turnstileToken,
          user_id: user?.id || null,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Odeslání se nezdařilo. Zkuste to prosím znovu.");
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Odeslání se nezdařilo. Zkuste to prosím znovu.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="inquiry__success">
        <strong>Děkujeme za váš zájem.</strong>
        <br />
        Budeme vás kontaktovat.
      </div>
    );
  }

  return (
    <>
      <h3>Máte zájem?</h3>
      <p style={{ fontSize: 14, color: "var(--ink3)", marginBottom: 20 }}>
        Vyplňte formulář a ozveme se vám.
      </p>
      <form className="inquiry__form" onSubmit={handleSubmit} noValidate>
        {error && <div className="inquiry__error">{error}</div>}
        <input
          type="text"
          placeholder="Vaše jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="tel"
          placeholder="Telefon (nepovinné)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <textarea
          placeholder="Zpráva"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
        />
        {/* Honeypot — vizualne skryto, boti vyplni vsechna pole */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
          aria-hidden="true"
        />
        <Turnstile onVerify={handleVerify} />
        <button
          type="submit"
          className="btn btn--fill btn--full"
          disabled={submitting}
        >
          {submitting ? "Odesílám..." : "Odeslat poptávku"}
        </button>
      </form>
    </>
  );
}
