import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error: insertError } = await supabase.from("inquiries").insert({
        listing_id: listing?.id,
        name,
        email,
        phone: phone || null,
        message,
        user_id: user?.id || null,
      });

      if (insertError) throw insertError;
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
      <form className="inquiry__form" onSubmit={handleSubmit}>
        {error && <div className="inquiry__error">{error}</div>}
        <input
          type="text"
          placeholder="Vaše jméno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Telefon (nepovinné)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          placeholder="Zpráva"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
        />
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
