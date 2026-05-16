import { Link } from "react-router-dom";

const UPDATED = "16. května 2026";

export default function Terms() {
  return (
    <section className="legal">
      <div className="legal__wrap">
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <Link to="/">Domů</Link><span>/</span><span>Obchodní podmínky</span>
        </div>
        <h1>Obchodní podmínky</h1>
        <p className="legal__updated">Účinné od {UPDATED}</p>

        <h2>1. Provozovatel</h2>
        <p>
          Provozovatelem webu logicpro.cz je <strong>LogicPro s.r.o.</strong>,
          se sídlem Praha 1, Národní 10, IČ: [doplnit].
        </p>

        <h2>2. Charakter služby</h2>
        <p>
          Web LogicPro je informační portál komerčních nemovitostí v regionu CEE.
          Slouží k prezentaci nabídek nemovitostí třetích stran a k zprostředkování
          kontaktu mezi zájemcem a nabízejícím (vlastníkem nebo realitním zástupcem).
        </p>
        <p>
          Provozovatel <strong>není smluvní stranou</strong> uzavírané transakce.
          Není zárukou pravosti, kompletnosti ani aktuálnosti zveřejněných údajů.
          Informace o nemovitostech mohou pocházet z externích zdrojů
          (Sreality, Nemovizor a další partneři) a být automatizovaně synchronizovány.
        </p>

        <h2>3. Registrace a uživatelský účet</h2>
        <ul>
          <li>Registrace je dobrovolná a bezplatná.</li>
          <li>Uživatel je povinen uvádět pravdivé údaje a chránit přihlašovací heslo.</li>
          <li>Provozovatel může účet zrušit při porušení těchto podmínek, zejména při zneužití systému (spam, vícenásobné účty pro automatizované akce).</li>
        </ul>

        <h2>4. Odeslání poptávky</h2>
        <p>
          Odesláním poptávky uživatel souhlasí s předáním uvedených kontaktních
          údajů (jméno, e-mail, telefon) provozovateli, případně realitnímu zástupci
          dané nabídky, za účelem zaslání odpovědi a vyjednávání podmínek.
        </p>

        <h2>5. Práva duševního vlastnictví</h2>
        <p>
          Všechny texty, grafika, kód a databáze webu jsou chráněny autorským zákonem
          a podléhají právům provozovatele nebo jeho partnerů. Použití obsahu mimo
          osobní nekomerční účely vyžaduje předchozí písemný souhlas.
        </p>

        <h2>6. Odpovědnost a omezení</h2>
        <ul>
          <li>Provozovatel neručí za dostupnost webu 24/7.</li>
          <li>Provozovatel neručí za škodu vzniklou z rozhodnutí uživatele na základě informací z webu — uživatel je povinen údaje ověřit u nabízejícího.</li>
          <li>Provozovatel není odpovědný za obsah dodaný třetími stranami.</li>
        </ul>

        <h2>7. Ochrana osobních údajů</h2>
        <p>
          Zpracování osobních údajů se řídí samostatným dokumentem{" "}
          <Link to="/ochrana-osobnich-udaju">Zásady ochrany osobních údajů</Link>.
        </p>

        <h2>8. Závěrečná ustanovení</h2>
        <p>
          Tyto podmínky se řídí právním řádem České republiky. Provozovatel si
          vyhrazuje právo podmínky kdykoli změnit. Změny nabývají účinnosti dnem
          zveřejnění na této stránce.
        </p>

        <p style={{ marginTop: 40, fontStyle: "italic", color: "var(--ink3)" }}>
          Pro otázky kontaktujte <a href="mailto:info@logicpro.cz">info@logicpro.cz</a>.
        </p>
      </div>
    </section>
  );
}
