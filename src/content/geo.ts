import type { Locale } from "@/i18n/routing";

export type EngineId = "chatgpt" | "gemini" | "claude" | "perplexity";

export type EngineMeta = {
  id: EngineId;
  name: string;
  pitch: number;
  v: number;
  bot: string;
  surfaceNote: Record<Locale, string>;
};

export const ENGINES: EngineMeta[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    pitch: 1,
    v: 0,
    bot: "OAI-SearchBot",
    surfaceNote: {
      it: "Ricerca web integrata e citazione di fonti locali",
      en: "Integrated web search and local source citations",
    },
  },
  {
    id: "gemini",
    name: "Gemini",
    pitch: 1.12,
    v: 1,
    bot: "Google-Extended",
    surfaceNote: {
      it: "Risposte collegate a Google Search e schede attività",
      en: "Answers linked to Google Search and Business Profiles",
    },
  },
  {
    id: "claude",
    name: "Claude",
    pitch: 1.26,
    v: 2,
    bot: "ClaudeBot",
    surfaceNote: {
      it: "Sintesi accurata da pagine chiare e ben strutturate",
      en: "Accurate synthesis from clearly structured pages",
    },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    pitch: 1.5,
    v: 3,
    bot: "PerplexityBot",
    surfaceNote: {
      it: "Risposte dirette con link cliccabili accanto a ogni fatto",
      en: "Direct answers with inline clickable source links",
    },
  },
];

export type EngineResponse = {
  before: {
    text: string;
    gap: string;
    signals: { label: string; ok: boolean }[];
  };
  after: {
    prefix: string;
    highlight: string;
    suffix: string;
    sourceLabel: string;
    citationUrl: string;
    signals: { label: string; ok: boolean }[];
  };
};

export type Scenario = {
  id: string;
  tab: string;
  sector: string;
  prompt: string;
  responses: Record<EngineId, EngineResponse>;
};

export type GeoContent = {
  badge: string;
  hero: {
    kicker: string;
    leadPrefix: string;
    leadSuffix: string;
    highlight: string;
    endDot: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    replay: string;
    trust: string;
  };
  shift: {
    eyebrow: string;
    beforeLabel: string;
    afterLabel: string;
    statementStart: string;
    statementMid: string;
    statementEnd: string;
    facts: { value: string; label: string }[];
  };
  stage: {
    eyebrow: string;
    title: string;
    lead: string;
    toggleAfter: string;
    toggleBefore: string;
    promptLabel: string;
    sourcePanelTitle: string;
    signalsTitle: string;
    disclaimer: string;
    missingTag: string;
    citedTag: string;
    scenarios: Scenario[];
  };
  process: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: {
      num: string;
      title: string;
      body: string;
      stageCaption: string;
      metrics: string[];
    }[];
    stageUi: {
      step1Prompt: string;
      step1Notes: Record<EngineId, string>;
      step2Layers: { tag: string; title: string; detail: string }[];
      step3Header: string;
      step3Cols: [string, string, string];
      step3Rows: { engine: EngineId; m1: string; m3: string }[];
      step3Footnote: string;
    };
  };
  deliverables: {
    eyebrow: string;
    title: string;
    lead: string;
    copywriting: {
      tag: string;
      title: string;
      body: string;
      btnBefore: string;
      btnAfter: string;
      beforeLabel: string;
      afterLabel: string;
      beforeText: string;
      afterPrefix: string;
      afterHighlight: string;
      afterSuffix: string;
    };
    llms: {
      tag: string;
      title: string;
      body: string;
      copyBtn: string;
      copiedBtn: string;
      fileTab: string;
      robotsTab: string;
      llmsCode: string;
      robotsCode: string;
    };
    schema: {
      tag: string;
      title: string;
      body: string;
      tabs: { id: "org" | "service" | "faq"; label: string; code: string }[];
    };
    audit: {
      tag: string;
      title: string;
      body: string;
      checks: string[];
    };
    seoBridge: {
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
    };
  };
  reality: {
    eyebrow: string;
    title: string;
    lead: string;
    beforeLabel: string;
    afterLabel: string;
    rows: { from: string; to: string }[];
  };
  timeline: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { at: string; title: string; body: string }[];
  };
  promise: {
    title: string;
    yes: string[];
    noTitle: string;
    no: string[];
    me: string;
    meRole: string;
    meLead: string;
    githubLabel: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  close: {
    eyebrow: string;
    prefix: string;
    highlight: string;
    lead: string;
    cta: string;
  };
};

const IT: GeoContent = {
  badge: "GEO",
  hero: {
    kicker: "GEO · Visibilità nelle risposte AI",
    leadPrefix: "Quando i clienti chiedono a",
    leadSuffix: "fai in modo di essere la",
    highlight: "prima scelta",
    endDot: ".",
    sub: "Sempre più persone chiedono a un assistente AI invece di aprire dieci link su Google. Riscrivo, strutturo e verifico il tuo sito perché legga dati veri e ti citi come fonte.",
    ctaPrimary: "Parliamo del tuo progetto",
    ctaSecondary: "Guarda come rispondono",
    replay: "Rivedi sequenza",
    trust: "Rispondo io, non un commerciale. Nessuna scorciatoia, preventivo scritto prima di iniziare.",
  },
  shift: {
    eyebrow: "Il cambiamento",
    beforeLabel: "Ieri · 10 link azzurri",
    afterLabel: "Oggi · 1 risposta consigliata",
    statementStart: "Chi cerca oggi non confronta dieci schede aperte nel browser.",
    statementMid: "Fa una domanda completa — e si affida ai pochi nomi che",
    statementEnd: "scelgono di citare.",
    facts: [
      {
        value: "4 assistenti",
        label: "ChatGPT, Gemini, Claude e Perplexity: controllo ogni mese cosa rispondono nel tuo settore.",
      },
      {
        value: "1 fonte chiara",
        label: "Il tuo sito diventa il riferimento strutturato da cui i modelli leggono servizi, prezzi e contatti.",
      },
      {
        value: "Ogni mese",
        label: "Ripeto le domande dei tuoi clienti e ti mostro come cambiano citazioni, link e precisione.",
      },
    ],
  },
  stage: {
    eyebrow: "Dal vivo · Confronto struttura",
    title: "Cosa cambia quando un assistente legge il tuo sito.",
    lead: "Scegli un’attività d’esempio, cambia assistente e confronta la risposta prima e dopo il lavoro su testi, Schema.org e /llms.txt.",
    toggleAfter: "Con GEO",
    toggleBefore: "Senza GEO",
    promptLabel: "Domanda del cliente",
    sourcePanelTitle: "Come ha costruito la risposta",
    signalsTitle: "Segnali letti sul sito",
    disclaimer: "Simulazione illustrativa basata su risposte tipiche: serve a mostrare come la chiarezza tecnica cambia la citazione.",
    missingTag: "Fonte non chiara",
    citedTag: "Fonte verificata",
    scenarios: [
      {
        id: "clinic",
        tab: "Studio medico",
        sector: "Odontoiatria · Brescia",
        prompt: "Quale studio dentistico a Brescia consigli per implantologia a carico immediato, trasparente su tempi e prima visita?",
        responses: {
          chatgpt: {
            before: {
              text: "A Brescia operano diversi studi odontoiatrici specializzati in implantologia. In generale è consigliabile contattare direttamente le segreterie per capire se offrono il carico immediato, tempi di attesa e modalità della prima visita.",
              gap: "Nessun nome citato: informazioni generiche senza prezzi, tempi né fonte verificabile.",
              signals: [
                { label: "Risposta diretta in apertura", ok: false },
                { label: "Schema MedicalClinic / Service", ok: false },
                { label: "Indice /llms.txt e crawler attivi", ok: false },
                { label: "Orari, sedi e tempi chiari", ok: false },
              ],
            },
            after: {
              prefix: "Per implantologia a carico immediato a Brescia puoi valutare ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: ": indica online il protocollo in giornata con TAC 3D in sede, la durata della prima visita valutativa (45 minuti) e gli orari aggiornati in centro.",
              sourceLabel: "Fonte citata",
              citationUrl: "studiobianchi.it/implantologia",
              signals: [
                { label: "Risposta diretta in apertura", ok: true },
                { label: "Schema MedicalClinic / Service", ok: true },
                { label: "Indice /llms.txt e crawler attivi", ok: true },
                { label: "Orari, sedi e tempi chiari", ok: true },
              ],
            },
          },
          gemini: {
            before: {
              text: "Molti centri dentali nella provincia di Brescia propongono impianti dentali. Sulla maggior parte dei siti non sono specificate le tempistiche esatte del carico immediato, quindi conviene confrontare più preventivi di persona.",
              gap: "Il sito resta indietro rispetto a schede più complete su Google e nei dati locali.",
              signals: [
                { label: "Coerenza sito ↔ Google Business", ok: false },
                { label: "Dati strutturati JSON-LD", ok: false },
                { label: "Pagina dedicata al trattamento", ok: false },
                { label: "FAQ reali su tempi e rischi", ok: false },
              ],
            },
            after: {
              prefix: "Tra le strutture documentate in zona emerge ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: ", con sede a Brescia centro: pubblica in modo chiaro percorso diagnostico, possibilità di provvisorio fisso entro 24 ore e recapiti coerenti tra sito e scheda locale.",
              sourceLabel: "Fonte collegata",
              citationUrl: "studiobianchi.it/carico-immediato",
              signals: [
                { label: "Coerenza sito ↔ Google Business", ok: true },
                { label: "Dati strutturati JSON-LD", ok: true },
                { label: "Pagina dedicata al trattamento", ok: true },
                { label: "FAQ reali su tempi e rischi", ok: true },
              ],
            },
          },
          claude: {
            before: {
              text: "Per scegliere uno studio a Brescia è utile cercare professionisti iscritti all’albo con esperienza chirurgica comprovata. Le pagine informative attuali risultano spesso troppo discorsive per confermare chi adotti il carico immediato.",
              gap: "Testi lunghi e vaghi: il modello preferisce non azzardare un nome non verificato.",
              signals: [
                { label: "Fatti verificabili nei primi 600 px", ok: false },
                { label: "Struttura ad headings netta", ok: false },
                { label: "Entità Organization + équipe", ok: false },
                { label: "Accesso ClaudeBot consentito", ok: false },
              ],
            },
            after: {
              prefix: "Stando alle informazioni pubblicate, ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: " descrive con precisione criteri clinici di idoneità ossea, utilizzo di chirurgia guidata digitale e passaggi dalla visita iniziale al controllo post-operatorio.",
              sourceLabel: "Riferimento letto",
              citationUrl: "studiobianchi.it/llms.txt",
              signals: [
                { label: "Fatti verificabili nei primi 600 px", ok: true },
                { label: "Struttura ad headings netta", ok: true },
                { label: "Entità Organization + équipe", ok: true },
                { label: "Accesso ClaudeBot consentito", ok: true },
              ],
            },
          },
          perplexity: {
            before: {
              text: "Dalle ricerche disponibili online compaiono portali aggregatori e directory generiche, senza una pagina ufficiale chiara sullo studio che spieghi fasi, costi indicativi e tempi clinici.",
              gap: "Gli aggregatori prendono il posto del sito ufficiale nei link di riferimento.",
              signals: [
                { label: "Link diretto citabile per sezione", ok: false },
                { label: "Tabelle / elenchi di sintesi", ok: false },
                { label: "FAQPage JSON-LD leggibile", ok: false },
                { label: "PerplexityBot autorizzato", ok: false },
              ],
            },
            after: {
              prefix: "Secondo i dettagli tecnici pubblicati da ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: ", la prima valutazione comprende ortopantomografia e piano scritto trasparente prima dell’intervento, con provvisorio fisso entro 24 ore nei casi idonei.",
              sourceLabel: "Citazione [1]",
              citationUrl: "studiobianchi.it/implantologia#fasi",
              signals: [
                { label: "Link diretto citabile per sezione", ok: true },
                { label: "Tabelle / elenchi di sintesi", ok: true },
                { label: "FAQPage JSON-LD leggibile", ok: true },
                { label: "PerplexityBot autorizzato", ok: true },
              ],
            },
          },
        },
      },
      {
        id: "b2b",
        tab: "Software B2B",
        sector: "Gestione turni · PMI italiane",
        prompt: "Cerco un software italiano semplice per gestire turni, ferie e timbrature di 35 dipendenti in officina e ufficio: cosa consigli?",
        responses: {
          chatgpt: {
            before: {
              text: "Sul mercato ci sono diverse suite HR internazionali come grandi piattaforme enterprise o fogli condivisi adattati, ma non è chiaro quali fornitori italiani siano pensati davvero per PMI sotto i 50 dipendenti.",
              gap: "Vengono suggeriti solo colossi esteri costosi perché spiegano meglio cosa fanno.",
              signals: [
                { label: "Target PMI e prezzi dichiarati", ok: false },
                { label: "Casi d’uso per settore chiari", ok: false },
                { label: "Schema SoftwareApplication", ok: false },
                { label: "/llms.txt con funzionalità chiave", ok: false },
              ],
            },
            after: {
              prefix: "Per una squadra mista da 35 persone una soluzione mirata è ",
              highlight: "TurnoChiaro",
              suffix: ": gestisce turni a rotazione, timbratura da badge o smartphone ed esportazione diretta verso lo studio paghe Zucchetti o TeamSystem, con piano trasparente a postazione.",
              sourceLabel: "Fonte citata",
              citationUrl: "turnochiaro.it/pmi-officina",
              signals: [
                { label: "Target PMI e prezzi dichiarati", ok: true },
                { label: "Casi d’uso per settore chiari", ok: true },
                { label: "Schema SoftwareApplication", ok: true },
                { label: "/llms.txt con funzionalità chiave", ok: true },
              ],
            },
          },
          gemini: {
            before: {
              text: "Le opzioni più note per la rilevazione presenze includono pacchetti modulari molto ampi. Spesso le alternative più snelle non riportano in modo leggibile compatibilità paghe e supporto in italiano.",
              gap: "Mancano integrazioni esplicite e domande frequenti leggibili da Google.",
              signals: [
                { label: "Pagina integrazioni paghe", ok: false },
                { label: "Prezzi e limiti chiari", ok: false },
                { label: "Schema Product / Offer", ok: false },
                { label: "Confronto sintetico per dimensione", ok: false },
              ],
            },
            after: {
              prefix: "Tra le piattaforme italiane adatte sotto i 50 dipendenti figura ",
              highlight: "TurnoChiaro",
              suffix: ", pensata per reparti produttivi e uffici con approvazione ferie da app, storico straordinari e assistenza diretta in italiano.",
              sourceLabel: "Fonte collegata",
              citationUrl: "turnochiaro.it/integrazioni",
              signals: [
                { label: "Pagina integrazioni paghe", ok: true },
                { label: "Prezzi e limiti chiari", ok: true },
                { label: "Schema Product / Offer", ok: true },
                { label: "Confronto sintetico per dimensione", ok: true },
              ],
            },
          },
          claude: {
            before: {
              text: "Conviene verificare se lo strumento scelto separi bene i profili tra operai su turni e personale d’ufficio. Dalle pagine marketing generiche non è facile capire tempi di avvio né vincoli contrattuali.",
              gap: "Troppi aggettivi di marketing ('all-in-one leader'), zero specifiche operative.",
              signals: [
                { label: "Specifiche operative senza fuffa", ok: false },
                { label: "Tempi di onboarding espliciti", ok: false },
                { label: "Documentazione pubblica leggibile", ok: false },
                { label: "ClaudeBot libero sulle docs", ok: false },
              ],
            },
            after: {
              prefix: "Dalla documentazione pubblica di ",
              highlight: "TurnoChiaro",
              suffix: " emerge un avvio guidato in 48 ore partendo dall’anagrafica Excel, con regole separate per reparti su tre turni e flessibilità oraria in ufficio.",
              sourceLabel: "Riferimento letto",
              citationUrl: "turnochiaro.it/llms.txt",
              signals: [
                { label: "Specifiche operative senza fuffa", ok: true },
                { label: "Tempi di onboarding espliciti", ok: true },
                { label: "Documentazione pubblica leggibile", ok: true },
                { label: "ClaudeBot libero sulle docs", ok: true },
              ],
            },
          },
          perplexity: {
            before: {
              text: "I confronti presenti sul web rimandano soprattutto a blog statunitensi e directory SaaS a pagamento, rendendo difficile trovare un software italiano già conforme alle chiusure mensili.",
              gap: "Nessun link al sito produttore nelle citazioni numerate.",
              signals: [
                { label: "Pagine comparabili e fattuali", ok: false },
                { label: "FAQPage per obiezioni comuni", ok: false },
                { label: "Conformità export tracciati paghe", ok: false },
                { label: "Canonical pulito multisezione", ok: false },
              ],
            },
            after: {
              prefix: "Tra le soluzioni italiane documentate per PMI da 10 a 100 addetti spicca ",
              highlight: "TurnoChiaro",
              suffix: ", che pubblica costi mensili senza costi nascosti di setup ed export diretto dei giustificativi INPS.",
              sourceLabel: "Citazione [1]",
              citationUrl: "turnochiaro.it/prezzi",
              signals: [
                { label: "Pagine comparabili e fattuali", ok: true },
                { label: "FAQPage per obiezioni comuni", ok: true },
                { label: "Conformità export tracciati paghe", ok: true },
                { label: "Canonical pulito multisezione", ok: true },
              ],
            },
          },
        },
      },
      {
        id: "local",
        tab: "Azienda tecnica locale",
        sector: "Fotovoltaico e pompe di calore · Lombardia",
        prompt: "Chi installa pompe di calore e fotovoltaico con accumulo tra Bergamo e Brescia seguendo anche pratiche GSE ed ENEA?",
        responses: {
          chatgpt: {
            before: {
              text: "Tra Bergamo e Brescia operano molti installatori e portali di preventivi online. È bene chiedere durante il sopralluogo se l’impresa gestisca internamente anche le pratiche ENEA e GSE.",
              gap: "Il cliente viene mandato verso portali intermediari che rivendono il contatto.",
              signals: [
                { label: "Area geografica e province chiare", ok: false },
                { label: "Elenco pratiche gestite in sede", ok: false },
                { label: "Schema LocalBusiness / areaServed", ok: false },
                { label: "Casi reali con potenze e rese", ok: false },
              ],
            },
            after: {
              prefix: "Per impianti completi tra Bergamo e Brescia puoi contattare ",
              highlight: "TermoNord Impianti",
              suffix: ": esegue sopralluogo tecnico gratuito, posa con squadre interne e gestione completa delle pratiche ENEA, GSE e detrazioni fiscali senza subappalti.",
              sourceLabel: "Fonte citata",
              citationUrl: "termonord.it/fotovoltaico-brescia-bergamo",
              signals: [
                { label: "Area geografica e province chiare", ok: true },
                { label: "Elenco pratiche gestite in sede", ok: true },
                { label: "Schema LocalBusiness / areaServed", ok: true },
                { label: "Casi reali con potenze e rese", ok: true },
              ],
            },
          },
          gemini: {
            before: {
              text: "La ricerca mostra risultati misti tra rivenditori nazionali e annunci sponsorizzati, senza distinguere chi dispone di tecnici propri in Lombardia.",
              gap: "I segnali locali sul sito sono deboli o nascosti dentro un PDF non indicizzato.",
              signals: [
                { label: "Testo HTML al posto di PDF chiusi", ok: false },
                { label: "Certificazioni F-GAS visibili", ok: false },
                { label: "Dati geografici strutturati", ok: false },
                { label: "Tempistiche medie di posa", ok: false },
              ],
            },
            after: {
              prefix: "In ambito locale tra Brescia e Bergamo si distingue ",
              highlight: "TermoNord Impianti",
              suffix: ", azienda certificata F-GAS con schede chiare per potenza impianto, marchi trattati e copertura di assistenza post-installazione entro 24 ore.",
              sourceLabel: "Fonte collegata",
              citationUrl: "termonord.it/pompe-di-calore",
              signals: [
                { label: "Testo HTML al posto di PDF chiusi", ok: true },
                { label: "Certificazioni F-GAS visibili", ok: true },
                { label: "Dati geografici strutturati", ok: true },
                { label: "Tempistiche medie di posa", ok: true },
              ],
            },
          },
          claude: {
            before: {
              text: "Quando si valuta un impianto ibrido è importante distinguere tra chi vende solo fornitura e chi segue dimensionamento termico e pratica GSE. I siti locali spesso non esplicitano il flusso.",
              gap: "Informazioni frammentate tra home generica e brochure scaricabili.",
              signals: [
                { label: "Processo chiavi in mano esplicito", ok: false },
                { label: "Risposte dirette alle domande", ok: false },
                { label: "Schede tecniche sintetiche", ok: false },
                { label: "/llms.txt ordinato per servizi", ok: false },
              ],
            },
            after: {
              prefix: "Secondo la pagina tecnica di ",
              highlight: "TermoNord Impianti",
              suffix: ", ogni installazione include dimensionamento termotecnico preliminare, installazione in 2–4 giorni lavorativi e invio diretto della pratica GSE ed ENEA.",
              sourceLabel: "Riferimento letto",
              citationUrl: "termonord.it/llms.txt",
              signals: [
                { label: "Processo chiavi in mano esplicito", ok: true },
                { label: "Risposte dirette alle domande", ok: true },
                { label: "Schede tecniche sintetiche", ok: true },
                { label: "/llms.txt ordinato per servizi", ok: true },
              ],
            },
          },
          perplexity: {
            before: {
              text: "Le fonti trovate riguardano guide generali sugli incentivi statali, senza collegare in modo diretto un installatore qualificato della provincia.",
              gap: "Nessun collegamento verso la pagina servizio aziendale.",
              signals: [
                { label: "Dati oggettivi di servizio + zona", ok: false },
                { label: "FAQ incentivi e pratiche chiare", ok: false },
                { label: "Link canonici per ogni servizio", ok: false },
                { label: "Crawler AI ammessi", ok: false },
              ],
            },
            after: {
              prefix: "Tra gli operatori strutturati sulla tratta Bergamo–Brescia, ",
              highlight: "TermoNord Impianti",
              suffix: " documenta pacchetti chiavi in mano da 4,5 a 10 kW con accumulo, pratiche di allaccio e detrazioni seguite internamente.",
              sourceLabel: "Citazione [1]",
              citationUrl: "termonord.it/pratiche-gse-enea",
              signals: [
                { label: "Dati oggettivi di servizio + zona", ok: true },
                { label: "FAQ incentivi e pratiche chiare", ok: true },
                { label: "Link canonici per ogni servizio", ok: true },
                { label: "Crawler AI ammessi", ok: true },
              ],
            },
          },
        },
      },
    ],
  },
  process: {
    eyebrow: "Come funziona",
    title: "Non si comanda cosa risponde un’AI. Si costruisce la fonte migliore.",
    lead: "Un metodo in tre passaggi concreti: prima misuro cosa dicono oggi, poi metto in ordine codice e testi, infine verifico ogni mese.",
    steps: [
      {
        num: "01",
        title: "Chiedo quello che chiedono i tuoi clienti.",
        body: "Interrogo ChatGPT, Gemini, Claude e Perplexity con le domande reali del tuo settore e della tua zona: vedo chi nominano, cosa copiano male e dove manchi tu.",
        stageCaption: "Mappa delle risposte di partenza · 4 assistenti",
        metrics: ["Domande reali per settore e città", "Confronto diretto con i 3 concorrenti citati", "Verifica di prezzi, orari e servizi riportati"],
      },
      {
        num: "02",
        title: "Il tuo sito diventa una fonte leggibile e citabile.",
        body: "Riscrivo l’apertura delle pagine in formato risposta-diretta, aggiungo dati strutturati Schema.org verificabili e pubblico /llms.txt con le regole giuste per i crawler.",
        stageCaption: "Architettura a 3 livelli sul sito",
        metrics: ["Copy Answer-First nelle pagine chiave", "Schema.org JSON-LD senza ambiguità", "/llms.txt + robots.txt configurato per AI search"],
      },
      {
        num: "03",
        title: "Misuro ogni mese come cambiano le risposte.",
        body: "Gli assistenti aggiornano indici e pesi con tempi propri. Ogni mese ripeto lo stesso set di domande e ti consegno il confronto tra mese precedente e attuale.",
        stageCaption: "Controllo mensile · Esempio report",
        metrics: ["Test ripetuti sugli stessi prompt chiave", "Verifica precisione fatti e link alla fonte", "Prossimi interventi in base ai vuoti emersi"],
      },
    ],
    stageUi: {
      step1Prompt: "Quale azienda consigli in zona per questo servizio?",
      step1Notes: {
        chatgpt: "Cita 2 concorrenti · manca prezzo chiaro",
        gemini: "Scheda locale forte · sito poco leggibile",
        claude: "Testo lungo in PDF · nessuna sintesi",
        perplexity: "Rimanda a directory · tuo sito assente",
      },
      step2Layers: [
        { tag: "01 · Contenuto", title: "Risposta diretta nei primi 2 paragrafi", detail: "Chi sei, per chi lavori, dove operi, tempi reali: subito leggibile senza fronzoli." },
        { tag: "02 · Entità", title: "Schema.org JSON-LD pulito", detail: "Organization, LocalBusiness, Service e FAQPage collegati tra loro nel DOM." },
        { tag: "03 · Accesso", title: "/llms.txt & Crawler AI", detail: "Indice ordinato delle pagine essenziali + via libera a OAI-SearchBot, ClaudeBot, PerplexityBot." },
      ],
      step3Header: "Report mensile · Stato citabilità",
      step3Cols: ["Assistente", "Partenza", "Dopo interventi"],
      step3Rows: [
        { engine: "chatgpt", m1: "Non nominata", m3: "Fonte citata + URL" },
        { engine: "gemini", m1: "Dati incompleti", m3: "Scheda e sito allineati" },
        { engine: "claude", m1: "Risposta generica", m3: "Servizi descritti bene" },
        { engine: "perplexity", m1: "Solo directory", m3: "Link diretto [1]" },
      ],
      step3Footnote: "Esempio di tracciamento mensile reale sulle stesse domande di controllo.",
    },
  },
  deliverables: {
    eyebrow: "Cosa ricevi sul sito",
    title: "Artefatti reali nel codice e nei testi.",
    lead: "Niente presentazioni piene di sigle vuote: ogni voce corrisponde a qualcosa che vedi funzionare online sul tuo dominio.",
    copywriting: {
      tag: "01 · Copywriting",
      title: "Struttura Answer-First pronta per essere estratta",
      body: "I modelli leggono l’inizio delle pagine e cercano affermazioni nette con dati concreti. Trasformo le frasi generiche in risposte chiare e citabili.",
      btnBefore: "Testo vago",
      btnAfter: "Answer-First",
      beforeLabel: "Come scrivono quasi tutti",
      afterLabel: "Come leggono le AI",
      beforeText: "Da oltre vent’anni mettiamo passione, qualità ed esperienza al servizio del cliente offrendo soluzioni innovative a 360 gradi su misura per ogni esigenza aziendale.",
      afterPrefix: "Progettiamo impianti industriali chiavi in mano tra Brescia e Bergamo: ",
      afterHighlight: "sopralluogo in 48 ore, dimensionamento interno e consegna media in 4 settimane",
      afterSuffix: ", con assistenza diretta entro 24 ore.",
    },
    llms: {
      tag: "02 · Indice macchine",
      title: "/llms.txt e regole crawler",
      body: "Una mappa testuale leggera nella radice del tuo sito che indica ai modelli dove trovare prezzi, servizi e FAQ senza perdersi nei menu.",
      copyBtn: "Copia esempio",
      copiedBtn: "Copiato",
      fileTab: "/llms.txt",
      robotsTab: "/robots.txt",
      llmsCode: `# Studio Bianchi — Odontoiatria Brescia\n> Studio odontoiatrico specializzato in implantologia,\n> igiene ed estetica dentale a Brescia centro.\n\n## Servizi principali\n- [Implantologia a carico immediato](/implantologia): TAC 3D, prima visita 45 min\n- [Ortodonzia trasparente](/ortodonzia): piani 6–18 mesi, controllo digitale\n- [Prezzi e finanziamenti](/trasparenza): listino indicativo e tasso zero\n\n## Sede e orari\n- Via Solferino 14, Brescia · Lun–Ven 08:30–19:30`,
      robotsCode: `# Accesso esplicito ai bot di ricerca AI\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: https://studiobianchi.it/sitemap.xml`,
    },
    schema: {
      tag: "03 · Dati strutturati",
      title: "Schema.org JSON-LD verificato",
      body: "Dati collegati nel codice della pagina: nessuna interpretazione ambigua su nome azienda, zona coperta, servizi e risposte.",
      tabs: [
        {
          id: "org",
          label: "Organization",
          code: `{\n  "@context": "https://schema.org",\n  "@type": "MedicalClinic",\n  "name": "Studio Bianchi",\n  "url": "https://studiobianchi.it",\n  "areaServed": "Brescia",\n  "telephone": "+39 030 000 0000"\n}`,
        },
        {
          id: "service",
          label: "Service",
          code: `{\n  "@type": "Service",\n  "name": "Implantologia a carico immediato",\n  "provider": { "@type": "MedicalClinic", "name": "Studio Bianchi" },\n  "serviceOutput": "Provvisorio fisso in 24h nei casi idonei",\n  "areaServed": "Brescia e provincia"\n}`,
        },
        {
          id: "faq",
          label: "FAQPage",
          code: `{\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "Quanto dura la prima visita?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "45 minuti con radiografia 3D e piano scritto."\n    }\n  }]\n}`,
        },
      ],
    },
    audit: {
      tag: "04 · Controllo mensile",
      title: "Verifica su 4 assistenti, mese dopo mese",
      body: "Non basta sistemare una volta: ogni mese eseguo il controllo su prompt costanti e controllo citazioni, errori fattuali e concorrenti emersi.",
      checks: [
        "Menzione diretta del brand",
        "Accuratezza di prezzi e orari",
        "Link alla fonte ufficiale",
        "Copertura prompt locali",
      ],
    },
    seoBridge: {
      eyebrow: "SEO + GEO lavorano insieme",
      title: "La velocità e Google restano la base da cui quasi tutte le AI pescano.",
      body: "ChatGPT Search, Perplexity e Gemini usano gli indici web reali per trovare le fonti aggiornate. Se il tuo sito è lento, mal indicizzato o invisibile su Google, nemmeno la GEO basta: per questo integro sempre basi tecniche SEO solide.",
      cta: "Vedi il servizio SEO tecnica",
    },
  },
  reality: {
    eyebrow: "Ti riconosci?",
    title: "Cosa cambia per chi ti cerca.",
    lead: "Sempre più persone chiedono a un assistente invece di cercare link per link. Essere chiari e citabili trasforma questo cambio in contatti reali.",
    beforeLabel: "Oggi",
    afterLabel: "Dopo l’intervento",
    rows: [
      {
        from: "L’assistente non ti nomina affatto, oppure consiglia solo due concorrenti storici",
        to: "Compari tra le risposte concrete quando chiedono del tuo servizio o città",
      },
      {
        from: "Riporta vecchi orari, un indirizzo chiuso o servizi che non offri più",
        to: "Legge sul tuo sito dati aggiornati e strutturati di cui si fida",
      },
      {
        from: "Le tue pagine sono muri di testo autoreferenziali impossibili da sintetizzare",
        to: "Risposte dirette nei primi secondi, pronte per essere citate con link",
      },
      {
        from: "Nessuna idea di come ChatGPT, Gemini o Perplexity parlino della tua azienda",
        to: "Un resoconto mensile trasparente con le risposte reali catturate nel tempo",
      },
    ],
  },
  timeline: {
    eyebrow: "Dal primo incontro ai risultati",
    title: "Tempi chiari, passo dopo passo.",
    lead: "Le fasi di lavoro sono lineari. Nel preventivo scritto trovi date, ore stimate e priorità prima di iniziare.",
    items: [
      {
        at: "Giorno 1",
        title: "Chiamata conoscitiva da 30 minuti",
        body: "Mi racconti cosa vendi, in che area lavori e chi sono i tuoi concorrenti diretti. Pochi giorni dopo ricevi una proposta scritta.",
      },
      {
        at: "Settimana 1",
        title: "Fotografia di partenza sui 4 assistenti",
        body: "Eseguo il primo giro di domande su ChatGPT, Gemini, Claude e Perplexity: vedi esattamente cosa dicono oggi di te e dei concorrenti.",
      },
      {
        at: "Primo mese",
        title: "Interventi sul sito e dati strutturati",
        body: "Riscrivo le aperture chiave, inserisco Schema.org JSON-LD, attivo /llms.txt e pulisco i blocchi tecnici che frenano bot e motori.",
      },
      {
        at: "Dal 2° mese",
        title: "Gli indici recepiscono i cambiamenti",
        body: "I motori AI aggiornano le proprie fonti con ritmi graduali: monitoriamo i primi cambi nelle citazioni e negli estratti.",
      },
      {
        at: "Ogni mese",
        title: "Controllo continuo e affinamenti",
        body: "Nuovo giro sugli stessi prompt, riepilogo leggibile di ciò che è migliorato e interventi mirati dove un assistente resta indietro.",
      },
    ],
  },
  promise: {
    title: "Cosa ti garantisco",
    yes: [
      "Un preventivo scritto prima di iniziare: cosa faccio sul sito, in quanto tempo e con quale costo.",
      "Parli sempre con me, dalla prima chiamata agli interventi tecnici sul codice.",
      "Testi, Schema.org, dominio e file restano interamente tuoi: zero dipendenze.",
      "Un controllo mensile vero, con le risposte raccolte e cosa conviene sistemare dopo.",
    ],
    noTitle: "Cosa non ti prometto",
    no: [
      "Non posso garantire o 'comprare' la citazione di ChatGPT, Gemini, Claude o Perplexity.",
      "Nessun trucco con testo nascosto o prompt injection che rischi penalizzazioni.",
      "Risultati dall’oggi al domani: servono fonti chiare e coerenza nel tempo.",
    ],
    me: "Filippo Corsini",
    meRole: "Ingegneria Informatica · Brescia",
    meLead: "Studio Ingegneria Informatica all’Università di Brescia e sviluppo software, siti web e sistemi tecnici per aziende e professionisti. Un solo referente, dalla diagnosi tecnica alle modifiche in codice.",
    githubLabel: "GitHub",
  },
  faq: {
    eyebrow: "Domande frequenti",
    title: "Tutto quello che vale la pena chiarire subito.",
    items: [
      {
        q: "È diverso dalla SEO per Google o è la stessa cosa?",
        a: "Lavorano in coppia, non in alternativa. Una base SEO veloce, pulita e ben indicizzata è la premessa: molte risposte AI nascono da ricerche web in tempo reale. La GEO aggiunge struttura Answer-First, dati di entità leggibili dai modelli, /llms.txt e monitoraggio sulle risposte generate.",
      },
      {
        q: "Puoi garantire che ChatGPT o Perplexity mi citino?",
        a: "No, e conviene diffidare di chi lo promette: nessun fornitore esterno controlla gli algoritmi di risposta di OpenAI, Google, Anthropic o Perplexity. Garantisco tutto ciò che è sotto controllo tecnico: sito veloce, crawler liberi, fatti chiari in pagina, Schema.org valido e controlli reali nel tempo.",
      },
      {
        q: "Serve rifare tutto il sito da zero?",
        a: "Quasi mai. Se il sito è già tuo ed è sano tecnicamente, lavoro direttamente su testi, intestazioni, metadati e file dedicati. Ti dico con franchezza nella prima chiamata solo se la piattaforma attuale blocca tutto.",
      },
      {
        q: "Il file /llms.txt da solo basta a farsi citare?",
        a: "No: /llms.txt è un indice utile per orientare agenti e modelli verso le pagine giuste, ma senza pagine chiare, contenuti specifici, presenza su fonti autorevoli e SEO di base non fa miracoli. Funziona come parte di un sistema ordinato.",
      },
      {
        q: "In quanto tempo si vedono i primi effetti?",
        a: "Per i motori collegati alla ricerca web live (come ChatGPT Search e Perplexity), i primi cambiamenti arrivano spesso tra 3 e 8 settimane dall’indicizzazione. Per la conoscenza interna dei modelli servono cicli di aggiornamento più lunghi.",
      },
      {
        q: "Quanto costa?",
        a: "Dipende dal numero di pagine chiave, dallo stato tecnico del sito e se si attiva solo la messa a punto iniziale o anche il monitoraggio mensile. Dopo i 30 minuti di chiamata ricevi un preventivo scritto voce per voce.",
      },
    ],
  },
  close: {
    eyebrow: "Inizia da una diagnosi chiara",
    prefix: "Quando il prossimo cliente chiede — fai in modo che",
    highlight: "trovi te.",
    lead: "In 30 minuti guardiamo come rispondono oggi gli assistenti nel tuo settore e capiamo se la GEO ha senso per la tua azienda.",
    cta: "Parliamo del tuo progetto",
  },
};

const EN: GeoContent = {
  badge: "GEO",
  hero: {
    kicker: "GEO · Visibility in AI answers",
    leadPrefix: "When customers ask",
    leadSuffix: "make sure you are the",
    highlight: "first choice",
    endDot: ".",
    sub: "More people ask an AI assistant instead of opening ten search links. I rewrite, structure and verify your site so models read real facts and cite you as a source.",
    ctaPrimary: "Let’s talk about your project",
    ctaSecondary: "See how they answer",
    replay: "Replay sequence",
    trust: "You talk to me, not a salesperson. No gimmicks, a written quote before we start.",
  },
  shift: {
    eyebrow: "The shift",
    beforeLabel: "Yesterday · 10 blue links",
    afterLabel: "Today · 1 curated answer",
    statementStart: "Buyers today don’t scan ten open browser tabs.",
    statementMid: "They ask a complete question — and trust the handful of names that",
    statementEnd: "choose to cite.",
    facts: [
      {
        value: "4 assistants",
        label: "ChatGPT, Gemini, Claude and Perplexity: tracked monthly for how they describe your sector.",
      },
      {
        value: "1 clear source",
        label: "Your site becomes the structured reference where models find services, locations and facts.",
      },
      {
        value: "Every month",
        label: "I rerun your buyers’ real questions and show how citations, links and accuracy evolve.",
      },
    ],
  },
  stage: {
    eyebrow: "Live comparison · Before & after",
    title: "What changes when an AI assistant reads your site.",
    lead: "Pick a business scenario, switch between the 4 assistants and compare an unstructured site against a GEO-ready source.",
    toggleAfter: "With GEO",
    toggleBefore: "Without GEO",
    promptLabel: "Customer prompt",
    sourcePanelTitle: "How the answer was built",
    signalsTitle: "Signals found on site",
    disclaimer: "Illustrative simulation based on typical answers: shows how technical clarity changes whether you are cited.",
    missingTag: "Unclear source",
    citedTag: "Verified source",
    scenarios: [
      {
        id: "clinic",
        tab: "Medical clinic",
        sector: "Dentistry · Brescia",
        prompt: "Which dental clinic in Brescia do you recommend for immediate-load implants, transparent on steps and first consultation?",
        responses: {
          chatgpt: {
            before: {
              text: "Several dental practices in Brescia offer implantology. In general it is best to call receptions directly to ask whether immediate loading is available, wait times and what the first check-up includes.",
              gap: "No practice named: vague overview with zero pricing clarity or verifiable source.",
              signals: [
                { label: "Direct answer up front", ok: false },
                { label: "MedicalClinic / Service schema", ok: false },
                { label: "/llms.txt index & crawler rules", ok: false },
                { label: "Clear hours, steps & locations", ok: false },
              ],
            },
            after: {
              prefix: "For immediate-load implants in Brescia, one well-documented option is ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: ": it details its same-day protocol with in-house 3D CBCT scan, 45-minute initial assessment and current city-centre opening hours.",
              sourceLabel: "Cited source",
              citationUrl: "studiobianchi.it/implantology",
              signals: [
                { label: "Direct answer up front", ok: true },
                { label: "MedicalClinic / Service schema", ok: true },
                { label: "/llms.txt index & crawler rules", ok: true },
                { label: "Clear hours, steps & locations", ok: true },
              ],
            },
          },
          gemini: {
            before: {
              text: "Many clinics around Brescia perform dental implants. Most websites omit clear timelines for immediate-load procedures, so comparing a few in-person quotes is advisable.",
              gap: "Site lags behind better-structured listings on Google and local signals.",
              signals: [
                { label: "Website ↔ Google Business match", ok: false },
                { label: "Structured JSON-LD entities", ok: false },
                { label: "Dedicated treatment page", ok: false },
                { label: "Plain FAQs on timing & risks", ok: false },
              ],
            },
            after: {
              prefix: "Among locally documented clinics, ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: " stands out in central Brescia: it publishes a transparent diagnostic pathway, 24-hour fixed provisional criteria and consistent local contact details.",
              sourceLabel: "Linked source",
              citationUrl: "studiobianchi.it/immediate-load",
              signals: [
                { label: "Website ↔ Google Business match", ok: true },
                { label: "Structured JSON-LD entities", ok: true },
                { label: "Dedicated treatment page", ok: true },
                { label: "Plain FAQs on timing & risks", ok: true },
              ],
            },
          },
          claude: {
            before: {
              text: "Choosing an implant specialist in Brescia requires checking surgical credentials. Current informational pages are often too generic to confirm who follows immediate-load protocols.",
              gap: "Long marketing prose: the model declines to name an unverified practice.",
              signals: [
                { label: "Verifiable facts at top of page", ok: false },
                { label: "Clean heading hierarchy", ok: false },
                { label: "Organization + clinical team data", ok: false },
                { label: "ClaudeBot crawl allowed", ok: false },
              ],
            },
            after: {
              prefix: "Based on its published clinical pages, ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: " clearly outlines bone suitability criteria, digitally guided surgery workflow and post-operative follow-up schedule.",
              sourceLabel: "Read source",
              citationUrl: "studiobianchi.it/llms.txt",
              signals: [
                { label: "Verifiable facts at top of page", ok: true },
                { label: "Clean heading hierarchy", ok: true },
                { label: "Organization + clinical team data", ok: true },
                { label: "ClaudeBot crawl allowed", ok: true },
              ],
            },
          },
          perplexity: {
            before: {
              text: "Web results mostly surface third-party directories and generic portals rather than an official clinic page breaking down steps, indicative fees and clinical timelines.",
              gap: "Directories capture the reference link slot instead of the clinic itself.",
              signals: [
                { label: "Citable section-level URL", ok: false },
                { label: "Comparison lists / clear tables", ok: false },
                { label: "Readable FAQPage JSON-LD", ok: false },
                { label: "PerplexityBot permitted", ok: false },
              ],
            },
            after: {
              prefix: "According to treatment details published by ",
              highlight: "Studio Bianchi Odontoiatria",
              suffix: ", the first visit includes panoramic/3D imaging and a written plan before surgery, with fixed temporaries placed within 24 hours for eligible cases.",
              sourceLabel: "Citation [1]",
              citationUrl: "studiobianchi.it/implantology#steps",
              signals: [
                { label: "Citable section-level URL", ok: true },
                { label: "Comparison lists / clear tables", ok: true },
                { label: "Readable FAQPage JSON-LD", ok: true },
                { label: "PerplexityBot permitted", ok: true },
              ],
            },
          },
        },
      },
      {
        id: "b2b",
        tab: "B2B Software",
        sector: "Shift scheduling · SMBs",
        prompt: "Looking for clean Italian software to manage shifts, time off and clock-ins for 35 staff across workshop and office: what do you recommend?",
        responses: {
          chatgpt: {
            before: {
              text: "Options range from large global enterprise HR suites to shared spreadsheets, though it is often unclear which Italian tools fit SMB teams under 50 staff cleanly.",
              gap: "Only massive foreign suites appear because their feature pages are clearer.",
              signals: [
                { label: "Explicit SMB target & pricing", ok: false },
                { label: "Clear workshop vs office use cases", ok: false },
                { label: "SoftwareApplication schema", ok: false },
                { label: "/llms.txt feature summary", ok: false },
              ],
            },
            after: {
              prefix: "For a 35-person mixed workshop and office team, a focused fit is ",
              highlight: "TurnoChiaro",
              suffix: ": it handles rotating shifts, badge or phone clock-ins and direct payroll export compatible with Italian labour consultants, with clear per-seat pricing.",
              sourceLabel: "Cited source",
              citationUrl: "turnochiaro.it/smb-shifts",
              signals: [
                { label: "Explicit SMB target & pricing", ok: true },
                { label: "Clear workshop vs office use cases", ok: true },
                { label: "SoftwareApplication schema", ok: true },
                { label: "/llms.txt feature summary", ok: true },
              ],
            },
          },
          gemini: {
            before: {
              text: "Well-known attendance platforms bundle broad enterprise modules. Leaner regional tools rarely state payroll format compatibility clearly on searchable pages.",
              gap: "Missing integration specs and structured FAQ entities.",
              signals: [
                { label: "Dedicated payroll integrations page", ok: false },
                { label: "Clear seat pricing & limits", ok: false },
                { label: "Product / Offer JSON-LD", ok: false },
                { label: "Concise team-size comparison", ok: false },
              ],
            },
            after: {
              prefix: "Among Italian tools tailored to under-50 teams is ",
              highlight: "TurnoChiaro",
              suffix: ", built for production floors and offices with mobile leave approval, overtime ledgers and direct Italian support.",
              sourceLabel: "Linked source",
              citationUrl: "turnochiaro.it/integrations",
              signals: [
                { label: "Dedicated payroll integrations page", ok: true },
                { label: "Clear seat pricing & limits", ok: true },
                { label: "Product / Offer JSON-LD", ok: true },
                { label: "Concise team-size comparison", ok: true },
              ],
            },
          },
          claude: {
            before: {
              text: "Verify whether the tool separates factory shift rules from flexible office hours. Generic marketing sites rarely specify onboarding timelines or contract terms.",
              gap: "Vague buzzwords ('all-in-one leader'), zero concrete operational specs.",
              signals: [
                { label: "Jargon-free operational specs", ok: false },
                { label: "Explicit onboarding timeline", ok: false },
                { label: "Readable public documentation", ok: false },
                { label: "ClaudeBot allowed on docs", ok: false },
              ],
            },
            after: {
              prefix: "Public documentation from ",
              highlight: "TurnoChiaro",
              suffix: " outlines a 48-hour guided setup from Excel rosters, separating 3-shift floor rules from flexible office schedules.",
              sourceLabel: "Read source",
              citationUrl: "turnochiaro.it/llms.txt",
              signals: [
                { label: "Jargon-free operational specs", ok: true },
                { label: "Explicit onboarding timeline", ok: true },
                { label: "Readable public documentation", ok: true },
                { label: "ClaudeBot allowed on docs", ok: true },
              ],
            },
          },
          perplexity: {
            before: {
              text: "Search comparisons pull mainly from US blogs and paid SaaS directories, making it hard to verify Italian payroll-compliant tools.",
              gap: "Zero direct citation pointing to the vendor's domain.",
              signals: [
                { label: "Factual feature comparison", ok: false },
                { label: "FAQPage for buyer objections", ok: false },
                { label: "Payroll export standards stated", ok: false },
                { label: "Clean canonical URLs", ok: false },
              ],
            },
            after: {
              prefix: "Documented Italian solutions for 10–100 employee SMBs include ",
              highlight: "TurnoChiaro",
              suffix: ", publishing transparent monthly tiers with zero mandatory setup fee and native payroll exports.",
              sourceLabel: "Citation [1]",
              citationUrl: "turnochiaro.it/pricing",
              signals: [
                { label: "Factual feature comparison", ok: true },
                { label: "FAQPage for buyer objections", ok: true },
                { label: "Payroll export standards stated", ok: true },
                { label: "Clean canonical URLs", ok: true },
              ],
            },
          },
        },
      },
      {
        id: "local",
        tab: "Regional engineering",
        sector: "Solar & heat pumps · Lombardy",
        prompt: "Who installs heat pumps and battery solar between Bergamo and Brescia while handling GSE and ENEA paperwork in-house?",
        responses: {
          chatgpt: {
            before: {
              text: "Several installers and lead-gen portals operate between Bergamo and Brescia. It helps to ask during inspection whether GSE and ENEA filings are handled internally.",
              gap: "Lead-generation portals capture the recommendation instead of real installers.",
              signals: [
                { label: "Explicit service area coverage", ok: false },
                { label: "In-house permits & filings listed", ok: false },
                { label: "LocalBusiness / areaServed schema", ok: false },
                { label: "Real system specs published", ok: false },
              ],
            },
            after: {
              prefix: "For turnkey solar and heat pump systems between Bergamo and Brescia, look at ",
              highlight: "TermoNord Impianti",
              suffix: ": it offers free on-site engineering survey, in-house installation crews and full ENEA, GSE and tax-credit paperwork without subcontracting.",
              sourceLabel: "Cited source",
              citationUrl: "termonord.it/solar-brescia-bergamo",
              signals: [
                { label: "Explicit service area coverage", ok: true },
                { label: "In-house permits & filings listed", ok: true },
                { label: "LocalBusiness / areaServed schema", ok: true },
                { label: "Real system specs published", ok: true },
              ],
            },
          },
          gemini: {
            before: {
              text: "Results mix national resellers with sponsored listings without distinguishing installers who employ local certified crews in Lombardy.",
              gap: "Regional facts are buried inside non-indexed PDFs.",
              signals: [
                { label: "HTML specs instead of closed PDFs", ok: false },
                { label: "F-GAS certification exposed", ok: false },
                { label: "Structured geographic data", ok: false },
                { label: "Clear lead times stated", ok: false },
              ],
            },
            after: {
              prefix: "Across Brescia and Bergamo, ",
              highlight: "TermoNord Impianti",
              suffix: " documents F-GAS certified teams, system kW tiers and 24-hour regional maintenance response windows.",
              sourceLabel: "Linked source",
              citationUrl: "termonord.it/heat-pumps",
              signals: [
                { label: "HTML specs instead of closed PDFs", ok: true },
                { label: "F-GAS certification exposed", ok: true },
                { label: "Structured geographic data", ok: true },
                { label: "Clear lead times stated", ok: true },
              ],
            },
          },
          claude: {
            before: {
              text: "Choosing a hybrid system requires verifying who owns thermal sizing versus GSE registration. Regional sites rarely describe that hand-off clearly.",
              gap: "Facts scattered between a generic homepage and brochure downloads.",
              signals: [
                { label: "Explicit turnkey scope", ok: false },
                { label: "Direct Q&A formatting", ok: false },
                { label: "Concise spec breakdowns", ok: false },
                { label: "Clean /llms.txt directory", ok: false },
              ],
            },
            after: {
              prefix: "According to the technical overview on ",
              highlight: "TermoNord Impianti",
              suffix: ", every project includes thermal sizing, 2–4 day installation and full GSE and ENEA submission managed internally.",
              sourceLabel: "Read source",
              citationUrl: "termonord.it/llms.txt",
              signals: [
                { label: "Explicit turnkey scope", ok: true },
                { label: "Direct Q&A formatting", ok: true },
                { label: "Concise spec breakdowns", ok: true },
                { label: "Clean /llms.txt directory", ok: true },
              ],
            },
          },
          perplexity: {
            before: {
              text: "Sources cover general national incentive rules rather than linking directly to an established regional installer.",
              gap: "Zero official company service link in numbered citations.",
              signals: [
                { label: "Objective scope + region data", ok: false },
                { label: "Incentive & filing FAQs", ok: false },
                { label: "Canonical service pages", ok: false },
                { label: "AI crawlers allowed", ok: false },
              ],
            },
            after: {
              prefix: "Among documented installers on the Bergamo–Brescia corridor, ",
              highlight: "TermoNord Impianti",
              suffix: " details turnkey 4.5–10 kW battery packages with grid tie-in and filings included.",
              sourceLabel: "Citation [1]",
              citationUrl: "termonord.it/filings-gse",
              signals: [
                { label: "Objective scope + region data", ok: true },
                { label: "Incentive & filing FAQs", ok: true },
                { label: "Canonical service pages", ok: true },
                { label: "AI crawlers allowed", ok: true },
              ],
            },
          },
        },
      },
    ],
  },
  process: {
    eyebrow: "How it works",
    title: "You can’t command what an AI says. You build the clearest source.",
    lead: "A three-step engineering process: measure what assistants answer today, structure code and copy, then verify every month.",
    steps: [
      {
        num: "01",
        title: "I ask what your customers ask.",
        body: "I query ChatGPT, Gemini, Claude and Perplexity with real buyer prompts for your sector and city — seeing who gets named, what gets misquoted and where you are missing.",
        stageCaption: "Baseline answer scan · 4 assistants",
        metrics: ["Real sector & location prompt suite", "Side-by-side look at cited competitors", "Fact check of pricing, hours and services"],
      },
      {
        num: "02",
        title: "Your site becomes a readable source.",
        body: "I rewrite key page openings in answer-first format, wire unambiguous Schema.org JSON-LD entities and ship /llms.txt plus crawler permissions.",
        stageCaption: "3-layer site architecture",
        metrics: ["Answer-first copy on commercial pages", "Clean Schema.org entity graph", "/llms.txt + AI crawler robots rules"],
      },
      {
        num: "03",
        title: "I measure changes every month.",
        body: "AI assistants refresh web indexes and weights on their own schedule. Every month I rerun the same prompt suite and deliver a clear comparison report.",
        stageCaption: "Monthly audit · Report format",
        metrics: ["Repeatable baseline prompt runs", "Citation accuracy & link tracking", "Next technical fixes where gaps stay"],
      },
    ],
    stageUi: {
      step1Prompt: "Which company do you recommend nearby for this service?",
      step1Notes: {
        chatgpt: "Cites 2 rivals · unclear pricing",
        gemini: "Strong Maps listing · weak site facts",
        claude: "Long brochure PDF · zero summary",
        perplexity: "Links to directory · own site missing",
      },
      step2Layers: [
        { tag: "01 · Content", title: "Direct answer in the opening lines", detail: "Who you are, who it’s for, area covered, real timings — readable without fluff." },
        { tag: "02 · Entities", title: "Valid Schema.org JSON-LD", detail: "Organization, LocalBusiness, Service and FAQPage cleanly linked in the DOM." },
        { tag: "03 · Access", title: "/llms.txt & AI Crawlers", detail: "Curated Markdown index at root + clean access for OAI-SearchBot, ClaudeBot, PerplexityBot." },
      ],
      step3Header: "Monthly report · Citability check",
      step3Cols: ["Assistant", "Baseline", "After updates"],
      step3Rows: [
        { engine: "chatgpt", m1: "Not named", m3: "Cited + URL" },
        { engine: "gemini", m1: "Partial data", m3: "Site & Maps aligned" },
        { engine: "claude", m1: "Generic reply", m3: "Clear service facts" },
        { engine: "perplexity", m1: "Directory only", m3: "Direct link [1]" },
      ],
      step3Footnote: "Example tracking view using consistent monthly buyer prompts.",
    },
  },
  deliverables: {
    eyebrow: "What gets built",
    title: "Concrete deliverables on your site.",
    lead: "No vague slide decks: every piece lives directly in your pages, metadata and server configuration.",
    copywriting: {
      tag: "01 · Copywriting",
      title: "Answer-First structure built to be quoted",
      body: "Models scan the top of each page for concise, verifiable statements. I turn vague slogans into structured, citable facts.",
      btnBefore: "Generic copy",
      btnAfter: "Answer-First",
      beforeLabel: "What most websites publish",
      afterLabel: "What assistants quote",
      beforeText: "For over twenty years we have put passion, quality and experience at our clients’ service, delivering innovative 360-degree bespoke solutions.",
      afterPrefix: "Turnkey industrial automation across Brescia and Bergamo: ",
      afterHighlight: "on-site survey within 48 hours, in-house PLC wiring and average 4-week delivery",
      afterSuffix: ", backed by 24-hour maintenance support.",
    },
    llms: {
      tag: "02 · Machine index",
      title: "/llms.txt & crawler permissions",
      body: "A lightweight Markdown index at your domain root pointing models straight to services, pricing and policies without menu noise.",
      copyBtn: "Copy sample",
      copiedBtn: "Copied",
      fileTab: "/llms.txt",
      robotsTab: "/robots.txt",
      llmsCode: `# Studio Bianchi — Dental Clinic Brescia\n> Dental clinic focused on immediate-load implants,\n> orthodontics and preventive care in central Brescia.\n\n## Core services\n- [Immediate-load implants](/implantology): 3D CBCT, 45-min first visit\n- [Clear aligners](/orthodontics): 6–18 month plans, digital scans\n- [Transparent fees](/fees): indicative guide and interest-free plans\n\n## Location & hours\n- Via Solferino 14, Brescia · Mon–Fri 08:30–19:30`,
      robotsCode: `# Explicit access for AI search crawlers\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: https://studiobianchi.it/sitemap.xml`,
    },
    schema: {
      tag: "03 · Structured data",
      title: "Verified Schema.org JSON-LD",
      body: "Machine-readable entities embedded in the page code so assistants extract name, location, services and answers with zero guesswork.",
      tabs: [
        {
          id: "org",
          label: "Organization",
          code: `{\n  "@context": "https://schema.org",\n  "@type": "MedicalClinic",\n  "name": "Studio Bianchi",\n  "url": "https://studiobianchi.it",\n  "areaServed": "Brescia",\n  "telephone": "+39 030 000 0000"\n}`,
        },
        {
          id: "service",
          label: "Service",
          code: `{\n  "@type": "Service",\n  "name": "Immediate-load implantology",\n  "provider": { "@type": "MedicalClinic", "name": "Studio Bianchi" },\n  "serviceOutput": "Fixed temporary tooth within 24h for eligible cases",\n  "areaServed": "Brescia"\n}`,
        },
        {
          id: "faq",
          label: "FAQPage",
          code: `{\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "How long is the first consultation?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "45 minutes including 3D imaging and written treatment plan."\n    }\n  }]\n}`,
        },
      ],
    },
    audit: {
      tag: "04 · Monthly tracking",
      title: "Measured across 4 engines every month",
      body: "Shipping once isn’t enough: I rerun the prompt suite monthly and track direct mentions, factual accuracy, source links and gaps.",
      checks: [
        "Direct brand mentions",
        "Accuracy of fees & hours",
        "Official URL cited",
        "Local prompt coverage",
      ],
    },
    seoBridge: {
      eyebrow: "SEO + GEO reinforce each other",
      title: "Site speed and Google indexing are still where most AI answers draw from.",
      body: "ChatGPT Search, Perplexity and Gemini rely on live web indexes to find current sources. If a site is slow or poorly indexed on Google, GEO alone cannot compensate — technical SEO remains the foundation.",
      cta: "Explore Technical SEO",
    },
  },
  reality: {
    eyebrow: "Sound familiar?",
    title: "What actually changes for your business.",
    lead: "When prospects ask a question instead of browsing ten tabs, clarity beats louder slogans.",
    beforeLabel: "Today",
    afterLabel: "After setup",
    rows: [
      {
        from: "Assistants omit you completely, or list only two legacy competitors",
        to: "You appear among concrete recommendations for your service and area",
      },
      {
        from: "AI repeats outdated hours, an old address or discontinued services",
        to: "Models read current, structured facts directly from your pages",
      },
      {
        from: "Pages read like long sales brochures that models struggle to summarise",
        to: "Direct opening answers ready to be quoted with a clean link back",
      },
      {
        from: "Zero visibility into how ChatGPT, Gemini or Perplexity present your brand",
        to: "A clear monthly report tracking real captured responses over time",
      },
    ],
  },
  timeline: {
    eyebrow: "From day one to monthly tracking",
    title: "Clear stages, zero black boxes.",
    lead: "You see dates, deliverables and priorities in a written quote before any work begins.",
    items: [
      {
        at: "Day 1",
        title: "30-minute discovery call",
        body: "We review what you offer, who buys from you and which competitors currently show up. A written quote follows in a few days.",
      },
      {
        at: "Week 1",
        title: "4-engine baseline scan",
        body: "I capture current answers from ChatGPT, Gemini, Claude and Perplexity against real buyer queries in your sector.",
      },
      {
        at: "Month 1",
        title: "Copy structure, Schema & /llms.txt",
        body: "I rewrite key page openings, deploy clean JSON-LD entities, add /llms.txt and clear any technical blocks in robots/sitemap.",
      },
      {
        at: "Month 2+",
        title: "Search & model indexes refresh",
        body: "Assistants pick up changes progressively: we monitor early citation improvements and missing factual points.",
      },
      {
        at: "Monthly",
        title: "Repeat audit & refinement",
        body: "Monthly check on the exact same prompts, concise comparison notes and targeted updates where competitors shift.",
      },
    ],
  },
  promise: {
    title: "What I guarantee",
    yes: [
      "A written quote before we start: scope, timelines and transparent line-by-line cost.",
      "You work directly with me from discovery call to code and content deployment.",
      "Pages, Schema.org, /llms.txt and domain stay 100% yours with zero lock-in.",
      "Real monthly checks with captured assistant replies and clear next steps.",
    ],
    noTitle: "What I won’t promise",
    no: [
      "Nobody can buy or guarantee a fixed spot inside ChatGPT, Gemini, Claude or Perplexity.",
      "No hidden white-text tricks or prompt injection hacks that risk penalties.",
      "Instant overnight jumps: trust and citations build progressively on clean facts.",
    ],
    me: "Filippo Corsini",
    meRole: "Computer Engineering · Brescia",
    meLead: "I study Computer Engineering at the University of Brescia and build software, fast websites and technical systems for businesses. One engineering contact from diagnosis to code.",
    githubLabel: "GitHub",
  },
  faq: {
    eyebrow: "Questions",
    title: "Worth clearing up before we start.",
    items: [
      {
        q: "How is GEO different from regular SEO?",
        a: "They reinforce each other. Fast pages, clean HTML and solid Google indexing remain essential because AI search engines pull heavily from live web indexes. GEO adds answer-first copy structure, explicit entity graphs in Schema.org, /llms.txt indexing and multi-assistant tracking.",
      },
      {
        q: "Can you guarantee ChatGPT or Perplexity will cite me?",
        a: "No — and be cautious of anyone claiming they can. No third party controls how OpenAI, Google, Anthropic or Perplexity rank responses. I guarantee everything under technical control: clean crawler access, clear opening facts, valid structured data and monthly verification.",
      },
      {
        q: "Do I have to rebuild my entire website?",
        a: "Almost never. As long as your site isn’t technically locked down, I update page copy hierarchy, Schema.org metadata and crawler files directly. On our first call I’ll tell you honestly if a platform limit exists.",
      },
      {
        q: "Is adding /llms.txt alone enough?",
        a: "No. /llms.txt helps agents find key URLs cleanly, but it only works when paired with concrete page copy, solid technical SEO and consistent business details across the web.",
      },
      {
        q: "How long before changes show up in answers?",
        a: "Assistants using live web search (such as ChatGPT Search and Perplexity) typically pick up structured updates within 3 to 8 weeks after re-indexing, while base model training cycles take longer.",
      },
      {
        q: "How much does it cost?",
        a: "It depends on the number of core service pages, current technical shape and whether you want initial implementation alone or monthly tracking too. You receive an itemised written quote after our 30-minute call.",
      },
    ],
  },
  close: {
    eyebrow: "Start with a straight look",
    prefix: "Next time a customer asks — make sure they",
    highlight: "find you.",
    lead: "In 30 minutes we look at how AI assistants answer in your sector today and see whether GEO makes real sense for your business.",
    cta: "Let’s talk about your project",
  },
};

export function getGeoContent(locale: Locale): GeoContent {
  return locale === "en" ? EN : IT;
}
