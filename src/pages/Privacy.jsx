import { Link } from "react-router-dom";
import { resetConsent } from "../lib/consent";

const UPDATED = "16. května 2026";

export default function Privacy() {
  function openConsent() {
    resetConsent();
    window.location.reload();
  }

  return (
    <section className="legal">
      <div className="legal__wrap">
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <Link to="/">Domů</Link><span>/</span><span>Ochrana osobních údajů</span>
        </div>
        <h1>Zásady ochrany osobních údajů</h1>
        <p className="legal__updated">Poslední aktualizace: {UPDATED}</p>

        <div className="legal__toc">
          <strong>Obsah</strong>
          <a href="#spravce">1. Správce údajů</a> &middot;{" "}
          <a href="#udaje">2. Jaké údaje zpracováváme</a> &middot;{" "}
          <a href="#ucely">3. Účely zpracování</a> &middot;{" "}
          <a href="#prava">4. Vaše práva</a> &middot;{" "}
          <a href="#cookies">5. Cookies</a> &middot;{" "}
          <a href="#kontakt">6. Kontakt</a>
        </div>

        <h2 id="spravce">1. Správce osobních údajů</h2>
        <p>
          Správcem osobních údajů ve smyslu nařízení (EU) 2016/679 (GDPR) je
          <strong> LogicPro s.r.o.</strong>, se sídlem Praha 1, Národní 10,
          IČ: [doplnit], zapsaná v obchodním rejstříku vedeném Městským soudem v Praze.
        </p>

        <h2 id="udaje">2. Jaké údaje zpracováváme</h2>
        <ul>
          <li><strong>Při registraci a přihlášení:</strong> e-mail, jméno, zaheslované přihlašovací údaje.</li>
          <li><strong>Při odeslání poptávky:</strong> jméno, e-mail, telefon, text zprávy, ID nemovitosti.</li>
          <li><strong>Při použití webu:</strong> IP adresa, typ prohlížeče, stránky, které navštívíte (pouze pokud udělíte souhlas s analytickými cookies).</li>
        </ul>

        <h2 id="ucely">3. Účely a právní základ zpracování</h2>
        <ul>
          <li><strong>Plnění smlouvy / poskytování služby</strong> — registrace účtu, správa oblíbených nemovitostí, uložená hledání.</li>
          <li><strong>Oprávněný zájem</strong> — odpověď na poptávku, ochrana proti spamu a podvodům (rate-limit, Cloudflare Turnstile).</li>
          <li><strong>Souhlas</strong> — analytické a marketingové cookies. Souhlas můžete kdykoli odvolat (viz <a href="#cookies">Cookies</a>).</li>
        </ul>

        <h2 id="prava">4. Vaše práva</h2>
        <p>Máte právo:</p>
        <ul>
          <li>na přístup ke svým údajům</li>
          <li>na opravu nepřesných údajů</li>
          <li>na výmaz („právo být zapomenut")</li>
          <li>na omezení zpracování</li>
          <li>na přenositelnost údajů</li>
          <li>vznést námitku proti zpracování</li>
          <li>podat stížnost u Úřadu pro ochranu osobních údajů (<a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer">uoou.cz</a>)</li>
        </ul>
        <p>
          Pro uplatnění práv nás kontaktujte na <a href="mailto:gdpr@logicpro.cz">gdpr@logicpro.cz</a>.
        </p>

        <h2 id="cookies">5. Cookies</h2>
        <p>Web používá tři kategorie cookies:</p>
        <ul>
          <li><strong>Nezbytné</strong> — bez nich web nefunguje (přihlášení, předvolby, ochrana proti spamu). Tyto nelze odmítnout.</li>
          <li><strong>Analytické</strong> — anonymizovaná statistika návštěvnosti. Volitelné.</li>
          <li><strong>Marketingové</strong> — personalizace nabídek, retargeting. Volitelné.</li>
        </ul>
        <p>
          <button type="button" className="btn btn--outline btn--sm" onClick={openConsent}>
            Změnit nastavení cookies
          </button>
        </p>

        <h3>Třetí strany</h3>
        <p>
          Sdílíme údaje s následujícími zpracovateli na základě smluv DPA:
        </p>
        <ul>
          <li><strong>Supabase Inc.</strong> (EU region) — hosting databáze a autentizace</li>
          <li><strong>Vercel Inc.</strong> — hosting webu</li>
          <li><strong>Cloudflare Inc.</strong> — ochrana proti spamu (Turnstile)</li>
        </ul>

        <h2 id="kontakt">6. Kontakt</h2>
        <p>
          LogicPro s.r.o.<br />
          Národní 10, 110 00 Praha 1<br />
          <a href="mailto:info@logicpro.cz">info@logicpro.cz</a><br />
          <a href="tel:+420224835000">+420 224 835 000</a>
        </p>
      </div>
    </section>
  );
}
