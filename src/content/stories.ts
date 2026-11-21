import type { Locale } from "@/i18n/routing";
import type { ServiceKey } from "./services";

/**
 * Il racconto di ogni servizio, in parole semplici: cosa ottieni, cosa cambia rispetto a oggi, come si arriva
 * al risultato e cosa resta in mano al cliente. Niente sigle né nomi di tecnologie: quelle stanno nel codice.
 * I passi di `how` seguono, uno a uno, le inquadrature dello spot dello stesso servizio.
 */
export type ServiceStory = {
  hero: { title: string; sub: string; trust: string };
  proof: { title: string; slugs: string[]; cta: string };
  promise: { title: string; yes: string[]; noTitle: string; no: string[]; me: string; meLead: string };
  close: { title: string; lead: string };
  facts: { v: string; l: string }[];
  changes: { title: string; lead: string; rows: { from: string; to: string }[] };
  how: { title: string; lead: string; steps: { t: string; b: string }[] };
  gets: { title: string; items: { t: string; b: string }[] };
  timeline: { title: string; lead: string; items: { at: string; t: string; b: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
};

type Body = {
  facts: [string, string][];
  /** titolo-risultato (≤ 10 parole) e sottotitolo: per chi, cosa, in che modo */
  hero?: [string, string];
  /** cosa non prometto, specifico del servizio */
  no?: string[];
  changesLead: string;
  rows: [string, string][];
  howLead: string;
  steps: [string, string][];
  gets: [string, string][];
  /** le tappe proprie del servizio; prima e dopo ci sono sempre la chiamata iniziale e il seguito */
  path: [string, string, string][];
  faq: [string, string][];
};

const COMMON = {
  it: {
    changes: "Cosa cambia",
    how: "Come funziona",
    gets: "Cosa ricevi",
    timeline: "Dal primo incontro al risultato",
    timelineLead: "Le tappe sono sempre le stesse. Date e costi precisi li trovi nel preventivo, prima di iniziare.",
    first: ["Giorno 1", "Una chiamata di 30 minuti", "Mi racconti cosa ti serve e cosa non funziona oggi. Pochi giorni dopo ricevi un preventivo scritto, con tempi e costi di ogni parte."] as [string, string, string],
    faq: "Domande",
    changesTitle: "Ti riconosci?",
    trust: "Rispondo io, non un commerciale. Preventivo scritto prima di iniziare.",
    proof: "Già fatto da me",
    proofCta: "Guarda il progetto",
    promise: "Cosa ti garantisco",
    yes: [
      "Un preventivo scritto prima di iniziare: cosa faccio, in quanto tempo, con quali costi.",
      "Parli sempre con me, dalla prima chiamata all’assistenza.",
      "Codice, dominio, dati e account restano intestati a te.",
      "Nessun vincolo: se un giorno vuoi cambiare, ti passo tutto, documentato.",
    ],
    noTitle: "Cosa non ti prometto",
    me: "Filippo Corsini",
    meLead: "Studio Ingegneria Informatica all’Università di Brescia e sviluppo software per aziende e professionisti. Progetto, scrivo il codice e lo seguo dopo il lancio: un solo referente, sempre lo stesso.",
    close: ["Raccontami cosa ti serve.", "In 30 minuti capiamo se e come posso aiutarti. Se la risposta è no, te lo dico."] as [string, string],
    cost: ["Quanto costa?", "Dipende da cosa serve davvero. Dopo la prima chiamata ricevi un preventivo scritto, voce per voce: decidi tu cosa fare subito e cosa rimandare."] as [string, string],
  },
  en: {
    changes: "What changes",
    how: "How it works",
    gets: "What you get",
    timeline: "From the first call to the result",
    timelineLead: "The stages are always the same. Exact dates and costs are in the quote, before we start.",
    first: ["Day 1", "A 30-minute call", "You tell me what you need and what isn’t working today. A few days later you get a written quote, with timing and cost for each part."] as [string, string, string],
    faq: "Questions",
    changesTitle: "Sound familiar?",
    trust: "You talk to me, not a salesperson. A written quote before we start.",
    proof: "Built before",
    proofCta: "See the project",
    promise: "What I guarantee",
    yes: [
      "A written quote before we start: what I’ll do, how long it takes, what it costs.",
      "You always talk to me, from the first call to support.",
      "Code, domain, data and accounts stay in your name.",
      "No lock-in: if you ever want to switch, I hand everything over, documented.",
    ],
    noTitle: "What I won’t promise",
    me: "Filippo Corsini",
    meLead: "I study Computer Engineering at the University of Brescia and build software for businesses and professionals. I design it, write the code and look after it after launch: one contact, always the same.",
    close: ["Tell me what you need.", "In 30 minutes we work out whether and how I can help. If the answer is no, I’ll tell you."] as [string, string],
    cost: ["How much does it cost?", "It depends on what you really need. After the first call you get a written quote, item by item: you decide what to do now and what can wait."] as [string, string],
  },
};

const build = (l: Locale, b: Body, k: ServiceKey): ServiceStory => {
  const c = COMMON[l];
  return {
    hero: { title: b.hero?.[0] ?? "", sub: b.hero?.[1] ?? "", trust: c.trust },
    proof: { title: c.proof, slugs: PROOF[k] ?? [], cta: c.proofCta },
    promise: { title: c.promise, yes: c.yes, noTitle: c.noTitle, no: b.no ?? [], me: c.me, meLead: c.meLead },
    close: { title: c.close[0], lead: c.close[1] },
    facts: b.facts.map(([v, l2]) => ({ v, l: l2 })),
    changes: { title: c.changesTitle, lead: b.changesLead, rows: b.rows.map(([from, to]) => ({ from, to })) },
    how: { title: c.how, lead: b.howLead, steps: b.steps.map(([t, b2]) => ({ t, b: b2 })) },
    gets: { title: c.gets, items: b.gets.map(([t, b2]) => ({ t, b: b2 })) },
    timeline: { title: c.timeline, lead: c.timelineLead, items: [c.first, ...b.path].map(([at, t, b2]) => ({ at, t, b: b2 })) },
    faq: { title: c.faq, items: [...b.faq, c.cost].map(([q, a]) => ({ q, a })) },
  };
};

const IT: Record<ServiceKey, Body> = {
  web: {
    facts: [
      ["2 settimane", "Ogni due settimane provi una versione che funziona, non un documento."],
      ["1 referente", "Parli sempre con chi progetta e sviluppa, dall’idea alla messa online."],
      ["100% tuo", "Dominio, codice e contenuti restano intestati a te."],
    ],
    changesLead: "Un sito fatto bene non è una vetrina: toglie lavoro a te e rende più facile sceglierti a chi ti cerca.",
    rows: [
      ["Il sito è fermo da anni, per ogni modifica devi chiamare qualcuno", "Cambi testi, foto e prezzi da solo, in pochi minuti"],
      ["Le richieste arrivano per telefono e qualcuna si perde", "Prenotazioni e richieste arrivano ordinate, con una notifica"],
      ["Su telefono si legge male e si apre lento", "Si apre in un attimo, su qualsiasi schermo"],
      ["Il lavoro si gestisce tra fogli Excel e messaggi", "Un solo posto dove tu e il tuo team trovate tutto"],
    ],
    howLead: "Tre passaggi, sempre nello stesso ordine. In ognuno vedi qualcosa di concreto e decidi tu se va bene.",
    steps: [
      ["Si parte da come lavori", "Prima decidiamo cosa deve fare il sito e per chi. Poi vedi le schermate vere, una pagina alla volta: correggere un disegno costa minuti, non settimane."],
      ["Va online senza sorprese", "Ogni versione passa da controlli automatici e arriva online in pochi secondi, senza fermare nulla. Se qualcosa non va, si torna indietro subito."],
      ["Poi lavora per te", "Chi visita trova quello che cerca e prenota da solo. Nella tua agenda compare subito la riga giusta, con i dati già in ordine."],
    ],
    gets: [
      ["Un sito che spiega bene cosa fai", "Pagine chiare, in più lingue se serve, pensate per chi deve capire in fretta cosa offri e come contattarti."],
      ["Uno strumento costruito sul tuo lavoro", "Prenotazioni, area riservata, ordini o clienti: fatto su come lavori tu, senza adattarti a un programma generico."],
      ["Dati in ordine e al sicuro", "Ognuno entra con il suo accesso e vede solo quello che gli serve. Niente più file sparsi."],
      ["Autonomia sui contenuti", "Testi, immagini e prodotti li modifichi tu da un pannello semplice, senza chiamare nessuno."],
    ],
    path: [
      ["Prima settimana", "Le schermate", "Disegno le pagine principali e le rivediamo insieme, finché non rispecchiano la tua attività."],
      ["Ogni due settimane", "Una versione da provare", "La usi davvero, su telefono e computer, e mi dici cosa cambiare. L’avanzamento lo segui dall’area clienti."],
      ["Prima del lancio", "Prova finale e messa online", "Controlliamo tutto insieme, ti spiego come usarlo e lo pubblico sul tuo dominio."],
      ["Dopo", "Resto il tuo riferimento", "Aggiornamenti, copie di sicurezza e modifiche quando servono."],
    ],
    faq: [
      ["Quanto tempo ci vuole?", "Un sito di presentazione richiede in genere poche settimane, uno strumento su misura qualche mese. I tempi precisi sono nel preventivo, divisi in tappe."],
      ["Devo preparare io testi e foto?", "Se li hai, parto da quelli. Altrimenti ti aiuto a scriverli e a scegliere le immagini giuste."],
      ["E dopo la messa online?", "Il sito è tuo. Se vuoi me ne occupo io con un canone mensile: aggiornamenti, sicurezza e piccole modifiche."],
      ["Userete un modello già pronto?", "No. Ogni sito è disegnato intorno alla tua attività, alla tua storia e al tuo lavoro. Niente modelli copiati."],
      ["Come funziona l’assistente su WhatsApp?", "È una chat con il tuo assistente: gli chiedi di cambiare una parola, una foto o un orario, come sta andando il sito e chi ha chiesto di essere ricontattato."],
      ["Mi troverò primo su Google?", "Nessuno può garantirlo. Il sito nasce veloce, chiaro e in ordine, con le informazioni che Google e gli assistenti di intelligenza artificiale leggono: è la base per farsi trovare."],
    ],
  },
  seo: {
    facts: [
      ["Si parte dai numeri", "Prima misuro dove sei oggi, pagina per pagina. Poi decido cosa sistemare."],
      ["Ogni mese", "Un resoconto leggibile: cosa è cambiato, cosa ha funzionato, cosa faccio dopo."],
      ["0 scorciatoie", "Solo interventi che Google approva: i risultati restano nel tempo."],
    ],
    changesLead: "Farsi trovare non dipende da un trucco: dipende da un sito veloce, chiaro e in ordine. È lavoro misurabile.",
    rows: [
      ["Il sito impiega secondi ad aprirsi e chi arriva se ne va", "Si apre subito, anche su telefono con rete lenta"],
      ["Google non capisce bene cosa offri", "Ogni pagina dice con chiarezza cosa fai e dove"],
      ["Chi ti cerca in zona trova i concorrenti", "Compari con scheda, orari e recensioni quando ti cercano vicino"],
      ["Non sai da dove arrivano le visite", "Un resoconto mensile con numeri che capisci"],
    ],
    howLead: "Prima si capisce, poi si sistema, poi si misura. E si ricomincia dal punto che rende di più.",
    steps: [
      ["Parto da come ti cercano", "Guardo le parole che usano i tuoi clienti e dove compari oggi. Da lì scelgo cosa conviene sistemare per primo."],
      ["Sistemo il sito", "Velocità, struttura delle pagine, testi e informazioni per Google: interventi concreti, uno alla volta, misurati prima e dopo."],
      ["Misuro, ogni mese", "Visite, posizioni e richieste ricevute: vedi cosa è migliorato e cosa faccio il mese dopo."],
    ],
    gets: [
      ["Un sito che si apre subito", "Pagine leggere e immagini ottimizzate: chi arriva non aspetta e Google lo premia."],
      ["Pagine che Google capisce", "Titoli, testi e struttura messi in ordine, così ogni pagina risponde a una ricerca precisa."],
      ["Presenza nella tua zona", "Scheda Google curata e informazioni coerenti ovunque, per chi cerca vicino a te."],
      ["Un resoconto chiaro", "Ogni mese i numeri che contano, spiegati in parole semplici, con i prossimi passi."],
    ],
    path: [
      ["Prima settimana", "La fotografia di partenza", "Misuro velocità, posizioni e problemi del sito. Ti consegno un elenco in ordine di importanza."],
      ["Primo mese", "Gli interventi che pesano di più", "Sistemo prima ciò che frena il sito e le pagine che possono portare più richieste."],
      ["Dal secondo mese", "I primi effetti", "Google impiega settimane a registrare i cambiamenti: di solito i risultati si vedono tra uno e tre mesi."],
      ["Ogni mese", "Resoconto e nuovi passi", "Vediamo insieme i numeri e decidiamo su cosa lavorare."],
    ],
    faq: [
      ["Mi garantisci la prima posizione?", "No, e diffida di chi lo fa: la classifica la decide Google. Garantisco il lavoro: interventi misurati e un resoconto ogni mese."],
      ["In quanto tempo si vedono i risultati?", "Dipende dal settore e da quanto è nuovo il sito. In genere i primi segnali arrivano tra uno e tre mesi, e crescono nel tempo."],
      ["Devo rifare il sito?", "Quasi mai. Parto da quello che hai e lo miglioro; ti dico con franchezza se rifarlo conviene davvero."],
    ],
  },
  geo: {
    facts: [
      ["4 assistenti", "ChatGPT, Gemini, Claude e Perplexity: controllo come parlano di te."],
      ["Ogni mese", "Rifaccio le domande dei tuoi clienti e ti mostro le risposte vere."],
      ["1 fonte chiara", "Il tuo sito diventa il posto da cui le AI prendono le informazioni giuste."],
    ],
    changesLead: "Sempre più persone chiedono a un assistente invece di cercare. La risposta nomina pochi nomi: conviene essere tra quelli.",
    rows: [
      ["L’AI non ti nomina, o nomina i concorrenti", "Compari tra le risposte quando chiedono del tuo settore"],
      ["Riporta orari, prezzi o servizi sbagliati", "Trova sul tuo sito dati corretti e aggiornati"],
      ["Le tue pagine sono lunghe e difficili da riassumere", "Risposte brevi e chiare, pronte per essere citate"],
      ["Non sai cosa dicono di te", "Un controllo mensile con le risposte, così come arrivano"],
    ],
    howLead: "Non si può comandare cosa risponde un’AI. Si può rendere il tuo sito la fonte più chiara e affidabile da cui pescare.",
    steps: [
      ["Chiedo quello che chiedono i tuoi clienti", "Faccio agli assistenti le domande tipiche del tuo settore e della tua zona, e guardo chi nominano e perché."],
      ["Rendo il sito facile da leggere e da citare", "Risposte dirette, informazioni complete e ordinate: le AI riprendono più volentieri chi spiega bene e in poche righe."],
      ["Controllo, ogni mese", "Ripeto le stesse domande e ti mostro come cambiano le risposte, con quello che sistemo dopo."],
    ],
    gets: [
      ["Contenuti pronti per essere citati", "Ogni pagina risponde a una domanda precisa, con le informazioni che servono in apertura."],
      ["Informazioni ordinate per le AI", "Chi sei, cosa fai, dove e a che condizioni: descritto in modo che un assistente non possa sbagliare."],
      ["Una mappa del sito per gli assistenti", "Un indice pensato per loro e regole chiare su chi può leggere cosa."],
      ["Un controllo mensile", "Le risposte di ogni assistente alle domande dei tuoi clienti, messe a confronto nel tempo."],
    ],
    path: [
      ["Prima settimana", "Come parlano di te oggi", "Raccolgo le risposte degli assistenti alle domande del tuo settore e le confronto con i concorrenti."],
      ["Primo mese", "Il sito diventa una fonte", "Riscrivo e riordino le pagine più importanti, così le informazioni giuste sono facili da trovare."],
      ["Nei mesi dopo", "Le risposte cambiano", "Gli assistenti si aggiornano con tempi loro: i cambiamenti arrivano gradualmente, e li teniamo sotto controllo."],
      ["Ogni mese", "Resoconto", "Cosa rispondono oggi, cosa è migliorato e su cosa lavoro dopo."],
    ],
    faq: [
      ["È diverso dal farsi trovare su Google?", "Si aiuta a vicenda. Un sito chiaro e veloce piace a Google e alle AI; qui il lavoro in più è sul modo in cui le informazioni sono scritte e ordinate."],
      ["Puoi garantire che l’AI mi citi?", "No: nessuno controlla cosa risponde un assistente. Posso fare in modo che trovi su di te informazioni chiare, complete e corrette, e misurare cosa succede."],
      ["Serve avere già un sito?", "Sì, è la base da cui le AI leggono. Se non c’è o è da rifare, si parte da lì."],
    ],
  },
  apps: {
    facts: [
      ["5 sistemi", "Android, iPhone, Mac, Windows e Linux, con lo stesso account."],
      ["Anche senza rete", "Continui a lavorare offline: appena torna la connessione tutto si riallinea."],
      ["2 settimane", "Ogni due settimane una versione di prova, installata sul tuo telefono."],
    ],
    changesLead: "Un’app serve quando il lavoro si fa lontano dalla scrivania, o quando i tuoi clienti devono averti sempre a portata di mano.",
    rows: [
      ["Un programma che gira solo su un computer in ufficio", "La stessa app su telefono e computer, ovunque sei"],
      ["Dati diversi su ogni dispositivo", "Tutto allineato in tempo reale, per tutti"],
      ["Senza connessione il lavoro si ferma", "Continui offline, si sincronizza dopo"],
      ["Per aggiornare bisogna reinstallare", "Le nuove versioni arrivano da sole"],
    ],
    howLead: "Si parte da cosa deve fare chi la usa, ogni giorno. Il resto viene dopo.",
    steps: [
      ["La scarichi come ogni altra app", "Pubblicata sugli store ufficiali, con la tua icona e il tuo nome. Chi la usa la installa in un tocco."],
      ["La stessa app, su ogni dispositivo", "Telefono, tablet e computer: stessa esperienza, adattata a ogni schermo. Non devi scegliere a quali clienti rinunciare."],
      ["Sempre allineata", "Quello che scrivi sul telefono lo ritrovi subito sul computer. Anche se nel frattempo eri senza rete."],
    ],
    gets: [
      ["L’app sul telefono", "Per Android e iPhone, pubblicata sugli store con il tuo nome."],
      ["L’app sul computer", "Per Windows, Mac e Linux, con notifiche e file come ogni programma serio."],
      ["Dati sempre in sincronia", "Stesso account e stessi dati ovunque, anche dopo un periodo senza connessione."],
      ["Aggiornamenti senza pensieri", "Le nuove versioni arrivano a tutti da sole; prima le provi tu."],
    ],
    path: [
      ["Prima settimana", "Cosa deve fare, schermata per schermata", "Definiamo le azioni principali e ti mostro un prototipo da toccare."],
      ["Ogni due settimane", "Una versione sul tuo telefono", "La installi, la usi e mi dici cosa non torna. Ogni giro aggiunge una parte."],
      ["Prima del lancio", "Prova con persone vere", "Un gruppo ristretto la usa per qualche giorno: sistemo ciò che emerge."],
      ["Dopo", "Pubblicazione e nuove versioni", "Mi occupo io degli store e degli aggiornamenti."],
    ],
    faq: [
      ["Serve davvero un’app o basta un sito?", "Spesso basta un sito fatto bene, e te lo dico. L’app conviene quando serve lavorare offline, ricevere notifiche o usare funzioni del telefono."],
      ["La pubblichi tu sugli store?", "Sì. Gli account restano intestati a te: io mi occupo di tutta la procedura e degli aggiornamenti."],
      ["Quanto tempo ci vuole?", "Qualche mese, a seconda di cosa deve fare. Nel preventivo trovi le tappe, e una prima versione usabile arriva presto."],
    ],
  },
  design: {
    facts: [
      ["Prima si prova", "Un prototipo da toccare, prima di spendere per lo sviluppo."],
      ["5 persone", "Bastano cinque prove con persone vere per vedere dove ci si blocca."],
      ["1 solo stile", "Sito, app e gestionale con gli stessi colori, testi e comandi."],
    ],
    changesLead: "Un’interfaccia chiara non è questione di gusto: si vede da quante persone arrivano in fondo senza chiedere aiuto.",
    rows: [
      ["Le persone iniziano una prenotazione e la lasciano a metà", "Arrivano in fondo, in meno passaggi"],
      ["Ogni schermata sembra fatta da una mano diversa", "Stessi colori, stessi comandi, ovunque"],
      ["I problemi si scoprono dopo aver sviluppato", "Si scoprono sul prototipo, quando correggere costa poco"],
      ["Chi usa il prodotto telefona per chiedere come si fa", "Capisce da solo cosa fare, al primo colpo"],
    ],
    howLead: "Si disegna, si prova con persone vere, si corregge. Solo allora si scrive il codice.",
    steps: [
      ["Progetto il percorso", "Disegno le schermate e le collego: ne esce un prototipo che si usa come l’app vera, prima che esista."],
      ["Lo provo con persone vere", "Cinque persone, un compito preciso, nessun aiuto. Guardo dove esitano e cosa non capiscono."],
      ["Correggo, e si vede", "Tolgo passaggi, sposto ciò che non si trova, riscrivo ciò che non è chiaro. Poi si misura quanti arrivano in fondo."],
    ],
    gets: [
      ["Il percorso, passo per passo", "Chi usa il prodotto, per fare cosa, in quanti passaggi: messo nero su bianco."],
      ["Un prototipo che si può toccare", "Schermate cliccabili da provare su telefono e computer, prima dello sviluppo."],
      ["Un sistema di stile", "Colori, testi e componenti definiti una volta e riusati ovunque: tutto resta coerente."],
      ["Usabile da tutti", "Testi leggibili, contrasti corretti, comandi raggiungibili anche da tastiera."],
    ],
    path: [
      ["Prima settimana", "Capire chi lo usa", "Parlo con te e con chi userà il prodotto: cosa devono fare e dove oggi si perdono."],
      ["Seconda settimana", "Il prototipo", "Le schermate principali, collegate e cliccabili, da provare."],
      ["Subito dopo", "La prova", "Cinque persone lo usano davvero. Ti mostro cosa è emerso e cosa cambio."],
      ["Alla fine", "Tutto pronto per lo sviluppo", "Schermate definitive e sistema di stile: chi sviluppa non deve inventare nulla."],
    ],
    faq: [
      ["Ho già un prodotto: si può migliorare senza rifarlo?", "Sì. Parto da quello che c’è, trovo i punti in cui le persone si bloccano e sistemo quelli."],
      ["Chi partecipa alle prove?", "Persone simili ai tuoi clienti. Se puoi coinvolgere clienti veri è ancora meglio."],
      ["Lo sviluppi anche tu?", "Sì, se vuoi: il passaggio dal disegno al codice resta nelle stesse mani. Ma il progetto è tuo e puoi darlo a chi preferisci."],
    ],
  },
  ai: {
    facts: [
      ["Tu approvi", "Prepara il lavoro, ma le decisioni che contano passano sempre da te."],
      ["I tuoi strumenti", "Lavora dentro posta, fogli e gestionale che usi già."],
      ["Dati riservati", "I tuoi documenti restano tuoi e non vengono usati per altro."],
    ],
    changesLead: "L’AI rende quando toglie il lavoro ripetitivo: leggere, smistare, ricopiare, preparare. Le decisioni restano a te.",
    rows: [
      ["Ore passate a leggere e smistare email", "Email già lette, ordinate e con la risposta pronta"],
      ["Dati ricopiati a mano da un programma all’altro", "Inseriti da soli, e tu controlli solo i casi dubbi"],
      ["Le risposte ai clienti arrivano il giorno dopo", "Bozze pronte in pochi minuti, da approvare con un tocco"],
      ["Documenti e informazioni che nessuno trova", "Fai una domanda e ricevi la risposta, con il documento da cui viene"],
    ],
    howLead: "Si sceglie un lavoro ripetitivo, uno solo, e si automatizza bene. Poi si passa al successivo.",
    steps: [
      ["Gli dai un compito", "In parole normali, come lo diresti a un collaboratore. Non c’è niente da imparare."],
      ["Lavora da solo, con i tuoi strumenti", "Legge le email, inserisce gli ordini, prepara le risposte. Ti mostra ogni passo e segnala ciò di cui non è sicuro."],
      ["Tu approvi, lui esegue", "Controlli il risultato e confermi. Quello che parte lo hai visto e deciso tu."],
    ],
    gets: [
      ["Un assistente che lavora sui tuoi dati", "Conosce listini, documenti e procedure della tua azienda, e risponde citando da dove prende le informazioni."],
      ["Lavori ripetitivi che si fanno da soli", "Smistare email, compilare documenti, inserire ordini: ti arriva solo ciò che richiede una decisione."],
      ["Collegato a ciò che usi già", "Posta, fogli di calcolo, gestionale: non devi cambiare programmi né abitudini."],
      ["Controllo e riservatezza", "Decidi tu cosa può fare da solo e cosa deve chiederti. I dati restano tuoi."],
    ],
    path: [
      ["Prima settimana", "Scegliamo da dove partire", "Guardo come lavorate e troviamo il compito ripetitivo che costa più ore."],
      ["Entro due settimane", "La prima prova, sui tuoi dati", "Lo vedi lavorare su casi veri e mi dici dove sbaglia."],
      ["Poi", "Si affina e si mette in uso", "Lo correggo sui casi difficili, poi lo usate ogni giorno, con te che approvi."],
      ["Dopo", "Un compito alla volta", "Quando il primo funziona, si passa al successivo."],
    ],
    faq: [
      ["E se sbaglia?", "Succede, come a chiunque. Per questo le azioni importanti passano da te, e i casi dubbi vengono segnalati invece che decisi da solo."],
      ["I miei dati sono al sicuro?", "Restano tuoi, non vengono usati per addestrare modelli e sono accessibili solo a chi autorizzi. Dove serve, tutto resta su server in Europa."],
      ["Il mio team deve imparare a usarlo?", "No: si usa scrivendo in italiano, dentro gli strumenti che avete già. Faccio comunque una breve formazione."],
    ],
  },
  hw: {
    facts: [
      ["Dal vivo", "Vedi cosa succede adesso alle tue macchine, senza andare a controllare."],
      ["Prima del guasto", "Un avviso quando un valore esce dalla norma, non quando è tardi."],
      ["Dal telefono", "Controlli tutto ovunque sei, anche di notte e nei festivi."],
    ],
    changesLead: "Macchine e impianti dicono molto, se qualcuno li ascolta. Un sensore e un avviso al momento giusto valgono più di un controllo a mano.",
    rows: [
      ["Ti accorgi del problema quando il danno è fatto", "Ricevi un avviso appena qualcosa esce dalla norma"],
      ["Qualcuno passa a controllare e annota su carta", "I dati si registrano da soli, giorno e notte"],
      ["Non sai cosa è successo nel fine settimana", "Lo storico completo, con grafici leggibili"],
      ["Ogni macchina ha il suo schermo e il suo programma", "Un’unica schermata per tutto"],
    ],
    howLead: "Si parte da cosa conviene sapere, e quando. Poi si sceglie come misurarlo.",
    steps: [
      ["Le macchine parlano, e avvisano", "Sensori collegati ai tuoi impianti mandano i dati in tempo reale. Se un valore esce dai limiti arriva subito un avviso, a te o a chi decidi."],
      ["Tutto sotto controllo, dal telefono", "Lo stato di ogni impianto in una schermata: cosa va bene, cosa richiede attenzione, cosa è successo mentre non c’eri."],
    ],
    gets: [
      ["Sensori e collegamenti installati", "Scelti e montati sui tuoi impianti, senza fermare la produzione più del necessario."],
      ["Una schermata unica", "Tutti i valori dal vivo e lo storico, leggibili da telefono e computer."],
      ["Avvisi su misura", "Decidi tu i limiti e chi viene avvisato, a che ora e come."],
      ["Lo storico dei dati", "Tutto registrato e consultabile, utile per controlli, qualità e manutenzione."],
    ],
    path: [
      ["Prima settimana", "Sopralluogo", "Guardo gli impianti e decidiamo cosa misurare e quali avvisi servono."],
      ["Poi", "Un primo impianto collegato", "Si parte da una macchina: vedi i dati dal vivo e proviamo gli avvisi."],
      ["Quando convince", "Si estende al resto", "Collego gli altri impianti, uno alla volta, senza fermare il lavoro."],
      ["Dopo", "Assistenza", "Controllo che sensori e avvisi continuino a funzionare e li adatto se cambia qualcosa."],
    ],
    faq: [
      ["Funziona con macchine vecchie?", "Quasi sempre. Dove la macchina non comunica da sola si aggiungono sensori esterni, senza modificarla."],
      ["Serve fermare la produzione?", "Il meno possibile: l’installazione si organizza nei momenti di fermo o fuori orario."],
      ["E se cade la connessione?", "I dati si conservano sul posto e si inviano appena torna la rete. Gli avvisi critici possono arrivare anche per altra via."],
    ],
  },
  api: {
    facts: [
      ["1 volta sola", "Ogni dato si inserisce una volta e arriva ovunque serve."],
      ["0 copia e incolla", "Ordini, pagamenti e clienti passano da un programma all’altro da soli."],
      ["Sempre tracciato", "Ogni passaggio è registrato: se qualcosa non arriva, si sa dove si è fermato."],
    ],
    changesLead: "Ogni programma fa bene il suo lavoro, ma tra uno e l’altro ci sei tu che ricopi. Collegarli toglie le ore più noiose della settimana.",
    rows: [
      ["Ricopi gli ordini dal negozio al gestionale", "Arrivano da soli, appena il cliente paga"],
      ["Fatture e scorte si aggiornano a fine giornata, a mano", "Si aggiornano nel momento in cui succede qualcosa"],
      ["Il cliente aspetta una conferma che parte quando hai tempo", "La conferma parte subito, in automatico"],
      ["Un errore di battitura diventa un ordine sbagliato", "Nessuno ricopia, nessuno sbaglia"],
    ],
    howLead: "Al centro c’è il tuo modo di lavorare. I programmi che usi già restano: imparano a parlarsi.",
    steps: [
      ["Al centro, il tuo software", "Un punto unico da cui passa tutto: negozio, pagamenti, posta, assistenza. Non devi cambiare i programmi che usi."],
      ["Un evento, e tutto si muove", "Arriva un ordine: il pagamento viene registrato, la fattura creata, le scorte aggiornate e il cliente avvisato. Senza che tu tocchi nulla."],
      ["Le ore tornano a te", "Il tempo che passavi a ricopiare lo usi per altro. E i dati sono gli stessi ovunque."],
    ],
    gets: [
      ["I tuoi programmi collegati", "Negozio, pagamenti, gestionale, posta e assistenza clienti che si passano i dati da soli."],
      ["Automatismi su misura", "Quando succede una cosa, ne partono altre: decisi insieme, sul tuo modo di lavorare."],
      ["Un registro di ogni passaggio", "Vedi cosa è partito, cosa è arrivato e cosa richiede attenzione."],
      ["Avvisi se qualcosa si ferma", "Se un collegamento non risponde lo so subito, prima che tu te ne accorga."],
    ],
    path: [
      ["Prima settimana", "La mappa di chi parla con chi", "Elenchiamo i programmi che usi e i dati che oggi passano a mano."],
      ["Entro due settimane", "Il primo collegamento", "Si parte da quello che fa risparmiare più tempo, e lo provi su casi veri."],
      ["Poi", "Gli altri, uno alla volta", "Ogni collegamento viene provato prima di entrare in uso."],
      ["Dopo", "Controllo continuo", "I programmi cambiano: tengo i collegamenti aggiornati e funzionanti."],
    ],
    faq: [
      ["Devo cambiare i programmi che uso?", "No. Si collegano quelli che hai già; ti dico solo se uno di questi non permette di farlo."],
      ["E se un programma non si può collegare?", "Quasi tutti hanno un modo. Dove non c’è, si trova un’alternativa: per esempio un’esportazione automatica."],
      ["Cosa succede se un collegamento si interrompe?", "Ricevo un avviso e intervengo. I dati in attesa non si perdono: ripartono appena tutto torna a posto."],
    ],
  },
  shop: {
    facts: [
      ["Aperto sempre", "Il negozio vende anche di notte e nei festivi, senza di te."],
      ["Pochi tocchi", "Dal prodotto al pagamento in meno di un minuto, da telefono."],
      ["Tutto allineato", "Ordini, pagamenti e magazzino si aggiornano da soli."],
    ],
    changesLead: "Vendere online funziona quando comprare è facile e quando, dietro, ordini e magazzino non diventano un secondo lavoro.",
    rows: [
      ["Vendi solo quando il negozio è aperto", "Vendi a ogni ora, anche a chi è lontano"],
      ["Il carrello si riempie e poi viene abbandonato", "Pagamento in un tocco, senza moduli infiniti"],
      ["Scopri che un prodotto è finito dopo averlo venduto", "Le scorte si aggiornano a ogni ordine"],
      ["Per cambiare un prezzo devi chiamare qualcuno", "Prodotti, prezzi e foto li gestisci tu"],
    ],
    howLead: "Davanti, un negozio semplice per chi compra. Dietro, un sistema che lavora per te.",
    steps: [
      ["Il cliente compra in pochi tocchi", "Trova il prodotto, lo aggiunge al carrello e paga con il metodo che ha già sul telefono. Nessuna registrazione obbligatoria."],
      ["Ordini e magazzino si aggiornano da soli", "L’ordine arriva già pagato, le scorte scendono e il cliente riceve la conferma. Tu prepari il pacco."],
    ],
    gets: [
      ["Un negozio su misura", "Con il tuo stile, veloce da telefono, pensato per far arrivare al pagamento senza ostacoli."],
      ["Pagamenti sicuri", "Carta e pagamenti rapidi dal telefono, gestiti da servizi certificati: i dati delle carte non passano da te."],
      ["Ordini e magazzino in ordine", "Un pannello dove vedi cosa è stato venduto, cosa spedire e cosa sta per finire."],
      ["Autonomia", "Aggiungi prodotti, cambi prezzi e lanci offerte da solo, in pochi minuti."],
    ],
    path: [
      ["Prima settimana", "Catalogo e schermate", "Definiamo prodotti, spedizioni e pagamenti, e ti mostro come sarà il negozio."],
      ["Ogni due settimane", "Una versione da provare", "Fai acquisti di prova, da telefono e computer, e mi dici cosa cambiare."],
      ["Prima del lancio", "Ordini veri di prova", "Controlliamo insieme pagamento, conferme, fatture e spedizione dall’inizio alla fine."],
      ["Dopo", "Il negozio cresce", "Aggiornamenti, sicurezza e nuove funzioni quando servono."],
    ],
    faq: [
      ["Ho già un negozio online: va rifatto?", "Non per forza. Se la base è buona si migliora quella; ti dico con franchezza quando conviene ripartire."],
      ["Quali pagamenti posso accettare?", "Carte, pagamenti rapidi dal telefono e bonifico. Gli incassi arrivano direttamente sul tuo conto."],
      ["Posso collegarlo al gestionale o al negozio fisico?", "Sì: ordini, fatture e scorte possono restare allineati tra online e punto vendita."],
    ],
  },
  ops: {
    facts: [],
    changesLead: "Un sito che si ferma, si apre lento o perde i dati costa clienti. Tenerlo in salute è un lavoro continuo, e non deve essere il tuo.",
    rows: [],
    howLead: "Quattro livelli lavorano insieme dietro al tuo sito. Tu non devi pensare a nessuno di questi.",
    steps: [
      ["Uno scudo davanti al sito", "Ogni visita passa prima da una protezione che ferma traffico falso e attacchi, e tiene pronte le pagine per servirle più in fretta."],
      ["Un indirizzo protetto, intestato a te", "Server preparato per il tuo progetto, con il tuo dominio e il lucchetto di sicurezza che si rinnova da solo."],
      ["Aggiornamenti che non rompono niente", "Ogni modifica passa da controlli automatici e va online solo se tutto è a posto. Se qualcosa non convince, si torna alla versione precedente in un clic."],
      ["Copie e controllo, anche di notte", "Ogni notte una copia di tutto. Se il sito smette di rispondere ricevo un avviso in pochi secondi, a qualsiasi ora, e intervengo."],
    ],
    gets: [
      ["Sempre online", "Server dedicato e configurato per il tuo progetto, con il tuo dominio e il lucchetto di sicurezza che si rinnova da solo."],
      ["Aggiornamenti senza interruzioni", "Sistema, sicurezza e nuove versioni del sito vanno online senza fermarlo, e si possono annullare in un clic."],
      ["Copie di sicurezza e controllo", "Una copia di tutto ogni notte, conservata altrove, e un controllo continuo che mi avvisa se qualcosa smette di rispondere."],
      ["Assistenza da chi conosce il progetto", "Piccole modifiche, dubbi e problemi: scrivi a me, che il sito l’ho costruito o l’ho studiato."],
    ],
    path: [
      ["Prima settimana", "Il passaggio", "Sposto il sito sul nuovo server senza fermarlo e attivo protezione, copie e controllo."],
      ["Ogni notte", "Copie di sicurezza", "Una copia completa di sito e dati, conservata in un luogo diverso."],
      ["Ogni mese", "Aggiornamenti e resoconto", "Sistema e componenti aggiornati, con un riepilogo di cosa è stato fatto."],
      ["Quando serve", "Intervento", "Se qualcosa si ferma ricevo l’avviso e intervengo, anche fuori orario."],
    ],
    faq: [
      ["Devo fare qualcosa io?", "No. Il sito e il dominio restano intestati a te; io mi occupo della parte tecnica e ti scrivo solo quando serve una tua decisione."],
      ["Cosa succede se il sito si ferma di notte?", "Il controllo automatico mi avvisa in pochi secondi, a qualsiasi ora. Intervengo subito e la mattina trovi un riepilogo di cosa è successo."],
      ["Posso cambiare fornitore in futuro?", "Sì. Codice, dati e accessi sono tuoi: se un giorno vuoi spostarti ti consegno tutto, documentato."],
      ["Gestisci anche siti che non hai fatto tu?", "Sì. Prima li studio e ti dico in che stato sono; poi li sposto e li tengo in salute come fossero miei."],
    ],
  },
};

const ENG: Record<ServiceKey, Body> = {
  web: {
    facts: [
      ["2 weeks", "Every two weeks you try a working version, not a document."],
      ["1 contact", "You always talk to the person who designs and builds it, from idea to launch."],
      ["100% yours", "Domain, code and content stay in your name."],
    ],
    changesLead: "A good website isn’t a shop window: it takes work off your plate and makes it easier for people to choose you.",
    rows: [
      ["The site hasn’t changed in years; every edit means calling someone", "You change text, photos and prices yourself, in minutes"],
      ["Requests come in by phone and some get lost", "Bookings and requests arrive in order, with a notification"],
      ["It’s slow and hard to read on a phone", "It opens instantly, on any screen"],
      ["Work is managed across spreadsheets and messages", "One place where you and your team find everything"],
    ],
    howLead: "Three steps, always in the same order. At each one you see something concrete and decide if it’s right.",
    steps: [
      ["It starts from how you work", "First we decide what the site must do and for whom. Then you see the real screens, one page at a time: fixing a drawing takes minutes, not weeks."],
      ["It goes live, no surprises", "Every version passes automatic checks and goes live in seconds without stopping anything. If something is off, we roll back straight away."],
      ["Then it works for you", "Visitors find what they’re looking for and book on their own. The right row shows up in your agenda at once, details already in order."],
    ],
    gets: [
      ["A site that explains what you do", "Clear pages, in several languages if needed, built for people who need to understand quickly what you offer and how to reach you."],
      ["A tool built around your work", "Bookings, a private area, orders or customers: made for how you work, not a generic program you have to adapt to."],
      ["Data in order and safe", "Everyone signs in with their own access and sees only what they need. No more scattered files."],
      ["Control over your content", "You edit text, images and products from a simple panel, without calling anyone."],
    ],
    path: [
      ["First week", "The screens", "I design the main pages and we review them together until they reflect your business."],
      ["Every two weeks", "A version to try", "You really use it, on phone and computer, and tell me what to change. You follow progress in the client area."],
      ["Before launch", "Final check and go-live", "We check everything together, I show you how to use it and publish it on your domain."],
      ["After", "I stay your contact", "Updates, backups and changes when needed."],
    ],
    faq: [
      ["How long does it take?", "A presentation site usually takes a few weeks, a custom tool a few months. Exact timing is in the quote, split into stages."],
      ["Do I need to prepare text and photos?", "If you have them, I start from those. Otherwise I help you write them and pick the right images."],
      ["And after launch?", "The site is yours. If you like, I look after it for a monthly fee: updates, security and small changes."],
      ["Will you use a ready-made template?", "No. Every site is designed around your business, your story and your work. No copied templates."],
      ["How does the WhatsApp assistant work?", "It’s a chat with your assistant: ask it to change a word, a photo or opening hours, how the site is doing and who asked to be called back."],
      ["Will I be first on Google?", "Nobody can guarantee that. The site is built fast, clear and tidy, with the information Google and AI assistants read: that’s the base for being found."],
    ],
  },
  seo: {
    facts: [
      ["Numbers first", "I measure where you stand today, page by page. Then I decide what to fix."],
      ["Every month", "A readable report: what changed, what worked, what I do next."],
      ["0 shortcuts", "Only work that Google approves of: results that last."],
    ],
    changesLead: "Being found isn’t about a trick: it’s about a fast, clear, tidy site. It’s measurable work.",
    rows: [
      ["The site takes seconds to open and visitors leave", "It opens instantly, even on a phone with a slow connection"],
      ["Google doesn’t quite understand what you offer", "Every page says clearly what you do and where"],
      ["People searching nearby find your competitors", "You show up with profile, hours and reviews when they search close by"],
      ["You don’t know where visits come from", "A monthly report with numbers you understand"],
    ],
    howLead: "First understand, then fix, then measure. And start again from whatever pays off most.",
    steps: [
      ["I start from how people search for you", "I look at the words your customers use and where you show up today. From there I pick what’s worth fixing first."],
      ["I fix the site", "Speed, page structure, copy and information for Google: concrete changes, one at a time, measured before and after."],
      ["I measure, every month", "Visits, positions and enquiries received: you see what improved and what I do the month after."],
    ],
    gets: [
      ["A site that opens instantly", "Light pages and optimised images: visitors don’t wait and Google rewards it."],
      ["Pages Google understands", "Titles, copy and structure put in order, so each page answers a specific search."],
      ["Presence in your area", "A well-kept Google profile and consistent details everywhere, for people searching near you."],
      ["A clear report", "Every month the numbers that matter, explained simply, with the next steps."],
    ],
    path: [
      ["First week", "The starting picture", "I measure speed, positions and problems on the site. You get a list in order of importance."],
      ["First month", "The changes that matter most", "I first fix what holds the site back and the pages that can bring the most enquiries."],
      ["From month two", "The first effects", "Google takes weeks to register changes: results usually show between one and three months."],
      ["Every month", "Report and next steps", "We look at the numbers together and decide what to work on."],
    ],
    faq: [
      ["Can you guarantee the top spot?", "No, and be wary of anyone who does: Google decides the ranking. I guarantee the work: measured changes and a report every month."],
      ["How soon will I see results?", "It depends on your field and how new the site is. First signs usually come between one and three months, and grow over time."],
      ["Do I need a new site?", "Almost never. I start from what you have and improve it; I’ll tell you honestly if rebuilding is really worth it."],
    ],
  },
  geo: {
    facts: [
      ["4 assistants", "ChatGPT, Gemini, Claude and Perplexity: I check how they talk about you."],
      ["Every month", "I ask your customers’ questions again and show you the real answers."],
      ["1 clear source", "Your site becomes the place AI takes the right information from."],
    ],
    changesLead: "More and more people ask an assistant instead of searching. The answer names only a few businesses: it pays to be one of them.",
    rows: [
      ["AI doesn’t mention you, or mentions competitors", "You appear in the answers when people ask about your field"],
      ["It reports wrong hours, prices or services", "It finds correct, up-to-date facts on your site"],
      ["Your pages are long and hard to summarise", "Short, clear answers, ready to be quoted"],
      ["You don’t know what they say about you", "A monthly check with the answers, exactly as they come"],
    ],
    howLead: "You can’t dictate what an AI answers. You can make your site the clearest, most reliable source to draw from.",
    steps: [
      ["I ask what your customers ask", "I put the typical questions of your field and area to the assistants, and look at who they name and why."],
      ["I make the site easy to read and to quote", "Direct answers, complete and tidy information: AI prefers to quote whoever explains well in a few lines."],
      ["I check, every month", "I repeat the same questions and show you how the answers change, with what I fix next."],
    ],
    gets: [
      ["Content ready to be quoted", "Each page answers a specific question, with the key information up front."],
      ["Information organised for AI", "Who you are, what you do, where and on what terms: described so an assistant can’t get it wrong."],
      ["A site map for assistants", "An index written for them and clear rules on who can read what."],
      ["A monthly check", "Each assistant’s answers to your customers’ questions, compared over time."],
    ],
    path: [
      ["First week", "How they talk about you today", "I collect the assistants’ answers to your field’s questions and compare them with competitors."],
      ["First month", "The site becomes a source", "I rewrite and reorder the most important pages, so the right information is easy to find."],
      ["In the following months", "The answers change", "Assistants update on their own schedule: changes come gradually, and we keep track of them."],
      ["Every month", "Report", "What they answer today, what improved and what I work on next."],
    ],
    faq: [
      ["Is it different from being found on Google?", "They help each other. A clear, fast site suits both Google and AI; the extra work here is in how information is written and organised."],
      ["Can you guarantee AI will mention me?", "No: nobody controls what an assistant answers. I can make sure it finds clear, complete and correct information about you, and measure what happens."],
      ["Do I need a site already?", "Yes, it’s what AI reads from. If there isn’t one or it needs rebuilding, we start there."],
    ],
  },
  apps: {
    facts: [
      ["5 systems", "Android, iPhone, Mac, Windows and Linux, with the same account."],
      ["Offline too", "Keep working without a connection: everything lines up again when it’s back."],
      ["2 weeks", "Every two weeks a test version, installed on your phone."],
    ],
    changesLead: "An app makes sense when work happens away from a desk, or when your customers need you always within reach.",
    rows: [
      ["A program that only runs on one office computer", "The same app on phone and computer, wherever you are"],
      ["Different data on every device", "Everything in step in real time, for everyone"],
      ["No connection, no work", "You carry on offline; it syncs later"],
      ["Updating means reinstalling", "New versions arrive by themselves"],
    ],
    howLead: "It starts from what the people using it need to do, every day. The rest comes after.",
    steps: [
      ["You download it like any other app", "Published on the official stores, with your icon and your name. People install it in one tap."],
      ["The same app, on every device", "Phone, tablet and computer: same experience, adapted to each screen. You don’t have to choose which customers to give up."],
      ["Always in step", "What you write on the phone is on the computer straight away. Even if you were offline in between."],
    ],
    gets: [
      ["The app on the phone", "For Android and iPhone, published on the stores under your name."],
      ["The app on the computer", "For Windows, Mac and Linux, with notifications and files like any serious program."],
      ["Data always in sync", "Same account and same data everywhere, even after a spell without connection."],
      ["Worry-free updates", "New versions reach everyone automatically; you try them first."],
    ],
    path: [
      ["First week", "What it must do, screen by screen", "We define the main actions and I show you a prototype you can tap."],
      ["Every two weeks", "A version on your phone", "You install it, use it and tell me what’s off. Each round adds a part."],
      ["Before launch", "Testing with real people", "A small group uses it for a few days: I fix what comes up."],
      ["After", "Publishing and new versions", "I take care of the stores and the updates."],
    ],
    faq: [
      ["Do I really need an app, or is a site enough?", "Often a good site is enough, and I’ll tell you so. An app pays off when you need to work offline, receive notifications or use phone features."],
      ["Do you publish it on the stores?", "Yes. The accounts stay in your name: I handle the whole procedure and the updates."],
      ["How long does it take?", "A few months, depending on what it has to do. The quote lists the stages, and a first usable version arrives early."],
    ],
  },
  design: {
    facts: [
      ["Try first", "A prototype you can tap, before spending on development."],
      ["5 people", "Five tests with real people are enough to see where they get stuck."],
      ["1 single style", "Website, app and back office with the same colours, type and controls."],
    ],
    changesLead: "A clear interface isn’t a matter of taste: it shows in how many people get to the end without asking for help.",
    rows: [
      ["People start a booking and drop it halfway", "They reach the end, in fewer steps"],
      ["Every screen looks made by a different hand", "Same colours, same controls, everywhere"],
      ["Problems show up after development", "They show up in the prototype, when fixing is cheap"],
      ["Users phone to ask how it works", "They understand what to do on their own, first time"],
    ],
    howLead: "Design, test with real people, correct. Only then is code written.",
    steps: [
      ["I design the journey", "I draw the screens and link them: the result is a prototype you use like the real app, before it exists."],
      ["I test it with real people", "Five people, one precise task, no help. I watch where they hesitate and what they don’t understand."],
      ["I correct it, and it shows", "I remove steps, move what can’t be found, rewrite what isn’t clear. Then we measure how many reach the end."],
    ],
    gets: [
      ["The journey, step by step", "Who uses the product, to do what, in how many steps: put in writing."],
      ["A prototype you can tap", "Clickable screens to try on phone and computer, before development."],
      ["A style system", "Colours, type and components defined once and reused everywhere: everything stays consistent."],
      ["Usable by everyone", "Readable text, proper contrast, controls reachable by keyboard too."],
    ],
    path: [
      ["First week", "Understanding who uses it", "I talk to you and to the people who will use the product: what they need to do and where they get lost today."],
      ["Second week", "The prototype", "The main screens, linked and clickable, ready to try."],
      ["Right after", "The test", "Five people really use it. I show you what came out and what I change."],
      ["At the end", "Ready for development", "Final screens and style system: whoever builds it has nothing to invent."],
    ],
    faq: [
      ["I already have a product: can it be improved without redoing it?", "Yes. I start from what exists, find the points where people get stuck and fix those."],
      ["Who takes part in the tests?", "People similar to your customers. If you can involve real customers, even better."],
      ["Do you build it too?", "Yes, if you like: design and code stay in the same hands. But the project is yours and you can give it to whoever you prefer."],
    ],
  },
  ai: {
    facts: [
      ["You approve", "It prepares the work, but decisions that matter always go through you."],
      ["Your tools", "It works inside the email, spreadsheets and software you already use."],
      ["Private data", "Your documents stay yours and aren’t used for anything else."],
    ],
    changesLead: "AI pays off when it removes repetitive work: reading, sorting, retyping, preparing. Decisions stay with you.",
    rows: [
      ["Hours spent reading and sorting email", "Email already read, sorted and with a reply ready"],
      ["Data retyped by hand from one program to another", "Entered automatically; you only check the doubtful cases"],
      ["Replies to customers go out the next day", "Drafts ready in minutes, approved with one tap"],
      ["Documents and information nobody can find", "Ask a question and get the answer, with the document it comes from"],
    ],
    howLead: "Pick one repetitive job, just one, and automate it well. Then move on to the next.",
    steps: [
      ["You give it a task", "In plain words, as you’d say it to a colleague. There’s nothing to learn."],
      ["It works on its own, with your tools", "It reads the emails, enters the orders, drafts the replies. It shows you each step and flags what it isn’t sure about."],
      ["You approve, it executes", "You check the result and confirm. Whatever goes out, you’ve seen and decided."],
    ],
    gets: [
      ["An assistant that works on your data", "It knows your company’s price lists, documents and procedures, and answers citing where the information comes from."],
      ["Repetitive jobs that do themselves", "Sorting email, filling in documents, entering orders: only what needs a decision reaches you."],
      ["Connected to what you already use", "Email, spreadsheets, back office: no new programs or habits."],
      ["Control and privacy", "You decide what it can do alone and what it must ask you. The data stays yours."],
    ],
    path: [
      ["First week", "We choose where to start", "I look at how you work and we find the repetitive task that costs the most hours."],
      ["Within two weeks", "The first trial, on your data", "You see it work on real cases and tell me where it goes wrong."],
      ["Then", "Refine and put to use", "I correct it on the hard cases, then you use it every day, with you approving."],
      ["After", "One task at a time", "When the first one works, we move to the next."],
    ],
    faq: [
      ["What if it gets something wrong?", "It happens, as with anyone. That’s why important actions go through you, and doubtful cases are flagged instead of decided alone."],
      ["Is my data safe?", "It stays yours, isn’t used to train models and is accessible only to those you authorise. Where needed, everything stays on servers in Europe."],
      ["Does my team need to learn to use it?", "No: you use it by writing in plain language, inside the tools you already have. I still run a short training."],
    ],
  },
  hw: {
    facts: [
      ["Live", "See what’s happening to your machines right now, without going to check."],
      ["Before the fault", "An alert when a value leaves the normal range, not when it’s too late."],
      ["From your phone", "Check everything wherever you are, nights and holidays included."],
    ],
    changesLead: "Machines and equipment say a lot, if someone listens. A sensor and an alert at the right moment beat a manual check.",
    rows: [
      ["You notice the problem when the damage is done", "You get an alert as soon as something leaves the normal range"],
      ["Someone goes round checking and writes it on paper", "Data records itself, day and night"],
      ["You don’t know what happened over the weekend", "The full history, with readable charts"],
      ["Each machine has its own screen and its own program", "One screen for everything"],
    ],
    howLead: "It starts from what’s worth knowing, and when. Then we choose how to measure it.",
    steps: [
      ["The machines talk, and warn you", "Sensors connected to your equipment send data in real time. If a value leaves its limits an alert goes out straight away, to you or whoever you choose."],
      ["Everything under control, from your phone", "The state of each machine on one screen: what’s fine, what needs attention, what happened while you were away."],
    ],
    gets: [
      ["Sensors and connections installed", "Chosen and fitted to your equipment, without stopping production more than necessary."],
      ["One single screen", "All live values and the history, readable from phone and computer."],
      ["Alerts made to measure", "You set the limits and who gets alerted, when and how."],
      ["The data history", "Everything recorded and searchable, useful for audits, quality and maintenance."],
    ],
    path: [
      ["First week", "Site visit", "I look at the equipment and we decide what to measure and which alerts are needed."],
      ["Then", "A first machine connected", "We start with one: you see live data and we try the alerts."],
      ["When you’re convinced", "Extend to the rest", "I connect the other machines, one at a time, without stopping work."],
      ["After", "Support", "I check that sensors and alerts keep working and adapt them if something changes."],
    ],
    faq: [
      ["Does it work with old machines?", "Almost always. Where the machine can’t communicate by itself, external sensors are added without modifying it."],
      ["Does production have to stop?", "As little as possible: installation is planned for downtime or out of hours."],
      ["What if the connection drops?", "Data is kept on site and sent as soon as the network is back. Critical alerts can also go out another way."],
    ],
  },
  api: {
    facts: [
      ["Just once", "Each piece of data is entered once and reaches everywhere it’s needed."],
      ["0 copy and paste", "Orders, payments and customers move from one program to another by themselves."],
      ["Always tracked", "Every step is logged: if something doesn’t arrive, you know where it stopped."],
    ],
    changesLead: "Each program does its job well, but between one and the next it’s you retyping. Connecting them removes the dullest hours of the week.",
    rows: [
      ["You retype orders from the shop into the back office", "They arrive by themselves, as soon as the customer pays"],
      ["Invoices and stock are updated by hand at the end of the day", "They update the moment something happens"],
      ["The customer waits for a confirmation sent when you have time", "The confirmation goes out immediately, automatically"],
      ["A typo becomes a wrong order", "Nobody retypes, nobody gets it wrong"],
    ],
    howLead: "Your way of working is at the centre. The programs you already use stay: they learn to talk to each other.",
    steps: [
      ["At the centre, your software", "A single point everything passes through: shop, payments, email, support. You don’t have to change the programs you use."],
      ["One event, and everything moves", "An order comes in: the payment is recorded, the invoice created, stock updated and the customer notified. Without you touching anything."],
      ["The hours come back to you", "The time you spent retyping goes to something else. And the data is the same everywhere."],
    ],
    gets: [
      ["Your programs connected", "Shop, payments, back office, email and customer support passing data to each other on their own."],
      ["Automations made to measure", "When one thing happens, others follow: decided together, around how you work."],
      ["A log of every step", "See what went out, what arrived and what needs attention."],
      ["Alerts if something stops", "If a connection stops responding I know straight away, before you notice."],
    ],
    path: [
      ["First week", "The map of who talks to whom", "We list the programs you use and the data that moves by hand today."],
      ["Within two weeks", "The first connection", "We start with the one that saves the most time, and you try it on real cases."],
      ["Then", "The others, one at a time", "Each connection is tested before going into use."],
      ["After", "Ongoing monitoring", "Programs change: I keep the connections updated and working."],
    ],
    faq: [
      ["Do I have to change the programs I use?", "No. We connect the ones you have; I’ll only tell you if one of them doesn’t allow it."],
      ["What if a program can’t be connected?", "Almost all have a way. Where there isn’t one, we find an alternative: an automatic export, for example."],
      ["What happens if a connection breaks?", "I get an alert and step in. Waiting data isn’t lost: it resumes as soon as everything is back."],
    ],
  },
  shop: {
    facts: [
      ["Always open", "The shop sells at night and on holidays too, without you."],
      ["A few taps", "From product to payment in under a minute, on a phone."],
      ["All in step", "Orders, payments and stock update by themselves."],
    ],
    changesLead: "Selling online works when buying is easy and when, behind the scenes, orders and stock don’t become a second job.",
    rows: [
      ["You only sell when the shop is open", "You sell at any hour, to people far away too"],
      ["Carts fill up and then get abandoned", "Payment in one tap, no endless forms"],
      ["You find out a product is gone after selling it", "Stock updates with every order"],
      ["Changing a price means calling someone", "You manage products, prices and photos yourself"],
    ],
    howLead: "In front, a simple shop for buyers. Behind, a system that works for you.",
    steps: [
      ["The customer buys in a few taps", "They find the product, add it to the cart and pay with the method already on their phone. No forced sign-up."],
      ["Orders and stock update by themselves", "The order arrives already paid, stock goes down and the customer gets the confirmation. You pack the parcel."],
    ],
    gets: [
      ["A made-to-measure shop", "In your style, fast on a phone, designed to get people to payment without obstacles."],
      ["Secure payments", "Cards and quick phone payments, handled by certified services: card details never pass through you."],
      ["Orders and stock in order", "A panel where you see what was sold, what to ship and what’s running low."],
      ["Independence", "Add products, change prices and launch offers yourself, in minutes."],
    ],
    path: [
      ["First week", "Catalogue and screens", "We define products, shipping and payments, and I show you what the shop will look like."],
      ["Every two weeks", "A version to try", "You make test purchases, on phone and computer, and tell me what to change."],
      ["Before launch", "Real test orders", "Together we check payment, confirmations, invoices and shipping from start to finish."],
      ["After", "The shop grows", "Updates, security and new features when needed."],
    ],
    faq: [
      ["I already have an online shop: does it need redoing?", "Not necessarily. If the base is good we improve that; I’ll tell you honestly when starting over is worth it."],
      ["Which payments can I accept?", "Cards, quick phone payments and bank transfer. Takings go straight to your account."],
      ["Can I connect it to my back office or physical shop?", "Yes: orders, invoices and stock can stay in step between online and the shop floor."],
    ],
  },
  ops: {
    facts: [],
    changesLead: "A site that goes down, loads slowly or loses data costs customers. Keeping it healthy is ongoing work, and it doesn’t have to be yours.",
    rows: [],
    howLead: "Four layers work together behind your site. You don’t have to think about any of them.",
    steps: [
      ["A shield in front of your site", "Every visit first goes through a protection layer that stops fake traffic and attacks, and keeps pages ready to serve them faster."],
      ["A protected address, in your name", "A server set up for your project, with your domain and a security padlock that renews itself."],
      ["Updates that break nothing", "Every change goes through automatic checks and only goes live if everything passes. If something looks wrong, roll back in one click."],
      ["Backups and monitoring, nights included", "A copy of everything every night. If the site stops responding I get an alert within seconds, at any hour, and step in."],
    ],
    gets: [
      ["Always online", "A dedicated server configured for your project, with your domain and a security padlock that renews itself."],
      ["Updates without downtime", "System, security and new versions of the site go live without stopping it, and can be undone in one click."],
      ["Backups and monitoring", "A copy of everything every night, stored elsewhere, and constant monitoring that alerts me if something stops responding."],
      ["Support from someone who knows the project", "Small changes, questions and problems: you write to me, because I built the site or studied it."],
    ],
    path: [
      ["First week", "The move", "I move the site to the new server without taking it down and switch on protection, backups and monitoring."],
      ["Every night", "Backups", "A full copy of site and data, stored in a different place."],
      ["Every month", "Updates and report", "System and components updated, with a summary of what was done."],
      ["When needed", "Intervention", "If something stops I get the alert and step in, out of hours too."],
    ],
    faq: [
      ["Do I need to do anything?", "No. The site and the domain stay in your name; I take care of the technical side and only write when a decision of yours is needed."],
      ["What if the site goes down at night?", "Monitoring alerts me within seconds, at any hour. I step in right away and in the morning you find a summary of what happened."],
      ["Can I switch provider later?", "Yes. Code, data and access are yours: if one day you want to move, I hand everything over, documented."],
      ["Do you look after sites you didn’t build?", "Yes. First I study them and tell you what state they’re in; then I move them and look after them as if they were mine."],
    ],
  },
};

type Extra = Pick<Body, "hero" | "no" | "rows">;
/** Il titolo-risultato, le frasi del cliente ("Ti riconosci?") e le promesse che non faccio. */
const EXTRA_IT: Record<ServiceKey, Extra> = {
  web: {
    hero: ["Un sito che fa chiamare i clienti, non solo guardare.", "Per studi, negozi e aziende: veloce su ogni telefono, facile da aggiornare, tuo al 100%."],
    rows: [
      ["«Per cambiare un orario sul sito devo chiamare qualcuno.»", "Testi, foto e prezzi li cambi tu, in pochi minuti"],
      ["«Le richieste arrivano al telefono e qualcuna si perde.»", "Prenotazioni e richieste arrivano ordinate, con una notifica"],
      ["«Da telefono il sito si apre lento e si legge male.»", "Si apre in un attimo, su qualsiasi schermo"],
      ["«Gestiamo tutto tra fogli Excel e messaggi.»", "Un solo posto dove tu e il tuo team trovate tutto"],
    ],
    no: ["Il primo posto su Google: nessuno può garantirlo.", "Funzioni che non ti servono, solo per gonfiare il progetto.", "Un modello già pronto spacciato per su misura."],
  },
  seo: {
    hero: ["Il tuo sito si apre in un attimo, e Google lo capisce.", "Sistemo velocità, errori e struttura che ti fanno perdere visite. Ti mostro i numeri prima e dopo."],
    rows: [
      ["«Chi mi cerca in zona trova i concorrenti.»", "Compari con scheda, orari e recensioni quando ti cercano vicino"],
      ["«Il sito ci mette secondi ad aprirsi.»", "Si apre subito, anche su telefono con rete lenta"],
      ["«Non so da dove arrivano le visite.»", "Un resoconto mensile con numeri che capisci"],
      ["«Ho pagato per la SEO e non ho capito cosa hanno fatto.»", "Ogni intervento spiegato e misurato, prima e dopo"],
    ],
    no: ["Il primo posto su Google: nessuno può garantirlo, lo scrive Google stesso.", "Scorciatoie che oggi funzionano e domani ti penalizzano."],
  },
  geo: {
    hero: ["Quando chiedono all’AI del tuo settore, ci sei anche tu?", "Controllo cosa dicono di te ChatGPT, Gemini, Claude e Perplexity, rendo le tue informazioni chiare ovunque e misuro ogni mese."],
    rows: [
      ["«Ho chiesto a ChatGPT e ha consigliato un concorrente.»", "Compari tra le risposte quando chiedono del tuo settore"],
      ["«L’AI riporta orari e servizi sbagliati.»", "Trova sul tuo sito informazioni corrette e aggiornate"],
      ["«Non so cosa dicono di me.»", "Un controllo mensile con le risposte, così come arrivano"],
      ["«Il sito è pieno di testo ma non risponde a nessuna domanda.»", "Risposte brevi e chiare, pronte per essere citate"],
    ],
    no: ["Che un assistente ti citi: nessuno controlla cosa risponde.", "Trucchi speciali: conta un sito chiaro, completo e coerente ovunque."],
  },
  apps: {
    hero: ["Un’app sola, su iPhone, Android e computer.", "Un unico progetto per tutte le piattaforme: costa meno di app separate ed è più semplice da aggiornare."],
    rows: [
      ["«Il nostro programma gira solo sul computer in ufficio.»", "La stessa app su telefono e computer, ovunque sei"],
      ["«Ognuno ha dati diversi sul suo dispositivo.»", "Tutto allineato in tempo reale, per tutti"],
      ["«Senza connessione non si lavora.»", "Continui offline, si sincronizza dopo"],
      ["«Ci avevano proposto due app diverse, al doppio del prezzo.»", "Un progetto solo, per tutti i sistemi"],
    ],
    no: ["Un’app quando basta un sito: se è così, te lo dico prima.", "Una pubblicazione sugli store a mio nome: gli account restano tuoi."],
  },
  design: {
    hero: ["Prova il prodotto prima di pagarne lo sviluppo.", "Un prototipo cliccabile, provato con persone vere, per decidere con i fatti e non a sensazione."],
    rows: [
      ["«Le persone iniziano a prenotare e poi lasciano a metà.»", "Arrivano in fondo, in meno passaggi"],
      ["«I clienti mi chiamano per chiedere come si usa.»", "Capiscono da soli cosa fare, al primo colpo"],
      ["«Abbiamo scoperto i problemi dopo averlo sviluppato.»", "Si scoprono sul prototipo, quando correggere costa poco"],
      ["«Ogni schermata sembra fatta da una persona diversa.»", "Stessi colori, stessi comandi, ovunque"],
    ],
    no: ["Un bel disegno mai provato da nessuno.", "File che restano a me: il progetto è tuo."],
  },
  ai: {
    hero: ["Il lavoro ripetitivo si fa da solo. Le decisioni restano a te.", "Parto da un compito che oggi ti ruba ore, lo automatizzo con i tuoi strumenti e ti lascio l’ultima parola sui casi dubbi."],
    rows: [
      ["«Passo la mattina a leggere e smistare email.»", "Email già lette, ordinate e con la risposta pronta"],
      ["«Ricopio gli ordini a mano da un programma all’altro.»", "Inseriti da soli, e tu controlli solo i casi dubbi"],
      ["«Rispondo ai clienti il giorno dopo.»", "Bozze pronte in pochi minuti, da approvare con un tocco"],
      ["«Nessuno trova mai il documento giusto.»", "Fai una domanda e ricevi la risposta, con il documento da cui viene"],
    ],
    no: ["Un’AI che non sbaglia mai: per questo le azioni importanti passano da te.", "Di sostituire le persone del tuo team: toglie il lavoro noioso, non chi lo fa."],
  },
  hw: {
    hero: ["Se il frigo si scalda alle 3 di notte, lo sai alle 3 e un minuto.", "Sensori sulle tue macchine, avvisi sul telefono e uno storico sempre pronto per i controlli."],
    rows: [
      ["«Ci siamo accorti del guasto quando la merce era da buttare.»", "Ricevi un avviso appena qualcosa esce dalla norma"],
      ["«Qualcuno passa a controllare e scrive su un foglio.»", "I dati si registrano da soli, giorno e notte"],
      ["«Non so cosa succede nel fine settimana.»", "Lo storico completo, con grafici leggibili"],
      ["«Ogni macchina ha il suo schermo e il suo programma.»", "Un’unica schermata per tutto"],
    ],
    no: ["Di cambiare le macchine che hai: si lavora su quelle.", "Sensori in più del necessario: si misura solo quello che serve."],
  },
  api: {
    hero: ["I tuoi programmi si parlano. Basta copia e incolla.", "Collego gli strumenti che usi già, così ordini, pagamenti e clienti si aggiornano da soli."],
    rows: [
      ["«Ricopio ogni ordine dal negozio al gestionale.»", "Arrivano da soli, appena il cliente paga"],
      ["«Fatture e scorte le aggiorno a fine giornata.»", "Si aggiornano nel momento in cui succede qualcosa"],
      ["«Il cliente aspetta la conferma finché ho tempo.»", "La conferma parte subito, in automatico"],
      ["«Un errore di battitura è diventato un ordine sbagliato.»", "Nessuno ricopia, nessuno sbaglia"],
    ],
    no: ["Di farti cambiare i programmi che usi.", "Collegamenti lasciati a sé stessi: li controllo e li tengo aggiornati."],
  },
  shop: {
    hero: ["Un negozio online che vende anche mentre dormi.", "Catalogo, pagamenti, spedizioni e magazzino in ordine. E lo gestisci da solo."],
    rows: [
      ["«Vendo solo quando il negozio è aperto.»", "Vendi a ogni ora, anche a chi è lontano"],
      ["«Il carrello si riempie e poi nessuno paga.»", "Pagamento in un tocco, senza moduli infiniti"],
      ["«Ho venduto un prodotto che era già finito.»", "Le scorte si aggiornano a ogni ordine"],
      ["«Per cambiare un prezzo devo chiamare qualcuno.»", "Prodotti, prezzi e foto li gestisci tu"],
    ],
    no: ["Vendite garantite: rendo facile comprare, il prodotto e il prezzo restano tuoi.", "Commissioni nascoste sui tuoi incassi: arrivano direttamente sul tuo conto."],
  },
  ops: {
    hero: ["Il sito sempre acceso, aggiornato e al sicuro.", "Server, copie di sicurezza, aggiornamenti e assistenza. Se qualcosa si rompe, scrivi a me."],
    rows: [
      ["«Il sito è andato giù e me l’ha detto un cliente.»", "Lo so io per primo, e intervengo subito"],
      ["«Non ricordo l’ultima volta che è stato aggiornato.»", "Aggiornamenti regolari, senza fermare il sito"],
      ["«Se si rompe qualcosa non so chi chiamare.»", "Un solo referente, che conosce il progetto"],
      ["«Non so se esiste una copia dei miei dati.»", "Una copia di tutto ogni notte, conservata altrove"],
    ],
    no: ["Zero guasti: possono capitare a chiunque. Prometto di accorgermene subito e di intervenire.", "Contratti pluriennali: se non sei soddisfatto, puoi andare."],
  },
};
const EXTRA_EN: Record<ServiceKey, Extra> = {
  web: {
    hero: ["A website that makes customers call, not just look.", "For practices, shops and businesses: fast on any phone, easy to update, 100% yours."],
    rows: [
      ["“Changing opening hours on the site means calling someone.”", "You change text, photos and prices yourself, in minutes"],
      ["“Requests come in by phone and some get lost.”", "Bookings and requests arrive in order, with a notification"],
      ["“On a phone the site is slow and hard to read.”", "It opens instantly, on any screen"],
      ["“We run everything across spreadsheets and messages.”", "One place where you and your team find everything"],
    ],
    no: ["First place on Google: nobody can guarantee it.", "Features you don’t need, just to inflate the project.", "A ready-made template passed off as custom."],
  },
  seo: {
    hero: ["Your site opens instantly, and Google understands it.", "I fix the speed, errors and structure that lose you visits. I show you the numbers before and after."],
    rows: [
      ["“People searching nearby find my competitors.”", "You show up with profile, hours and reviews when they search close by"],
      ["“The site takes seconds to open.”", "It opens instantly, even on a phone with a slow connection"],
      ["“I don’t know where visits come from.”", "A monthly report with numbers you understand"],
      ["“I paid for SEO and never understood what they did.”", "Every change explained and measured, before and after"],
    ],
    no: ["The top spot on Google: nobody can guarantee it, Google says so itself.", "Shortcuts that work today and get you penalised tomorrow."],
  },
  geo: {
    hero: ["When people ask AI about your field, are you there?", "I check what ChatGPT, Gemini, Claude and Perplexity say about you, make your information clear everywhere and measure every month."],
    rows: [
      ["“I asked ChatGPT and it recommended a competitor.”", "You appear in the answers when people ask about your field"],
      ["“AI reports the wrong hours and services.”", "It finds correct, up-to-date facts on your site"],
      ["“I don’t know what they say about me.”", "A monthly check with the answers, exactly as they come"],
      ["“The site is full of text but answers no question.”", "Short, clear answers, ready to be quoted"],
    ],
    no: ["That an assistant will mention you: nobody controls what it answers.", "Special tricks: what counts is a clear, complete site, consistent everywhere."],
  },
  apps: {
    hero: ["One app, on iPhone, Android and computer.", "A single project for every platform: cheaper than separate apps and simpler to update."],
    rows: [
      ["“Our software only runs on the office computer.”", "The same app on phone and computer, wherever you are"],
      ["“Everyone has different data on their device.”", "Everything in step in real time, for everyone"],
      ["“No connection, no work.”", "You carry on offline; it syncs later"],
      ["“We were quoted two separate apps, at twice the price.”", "One project, for every system"],
    ],
    no: ["An app when a website is enough: if so, I’ll tell you first.", "Store listings under my name: the accounts stay yours."],
  },
  design: {
    hero: ["Try the product before paying to build it.", "A clickable prototype, tested with real people, so you decide on facts rather than gut feeling."],
    rows: [
      ["“People start booking and drop out halfway.”", "They reach the end, in fewer steps"],
      ["“Customers phone to ask how it works.”", "They work out what to do on their own, first time"],
      ["“We found the problems after building it.”", "They show up in the prototype, when fixing is cheap"],
      ["“Every screen looks like a different person made it.”", "Same colours, same controls, everywhere"],
    ],
    no: ["A pretty design nobody has ever tested.", "Files that stay with me: the project is yours."],
  },
  ai: {
    hero: ["Repetitive work does itself. Decisions stay with you.", "I start from a task that eats your hours, automate it with your tools and leave you the final word on doubtful cases."],
    rows: [
      ["“I spend the morning reading and sorting email.”", "Email already read, sorted and with a reply ready"],
      ["“I retype orders from one program to another.”", "Entered automatically; you only check the doubtful cases"],
      ["“I reply to customers the next day.”", "Drafts ready in minutes, approved with one tap"],
      ["“Nobody can ever find the right document.”", "Ask a question and get the answer, with the document it comes from"],
    ],
    no: ["An AI that never makes mistakes: that’s why important actions go through you.", "To replace people on your team: it removes the dull work, not the people."],
  },
  hw: {
    hero: ["If the fridge warms up at 3 am, you know at 3:01.", "Sensors on your machines, alerts on your phone and a history always ready for inspections."],
    rows: [
      ["“We noticed the fault when the stock had to be thrown away.”", "You get an alert as soon as something leaves the normal range"],
      ["“Someone goes round checking and writes it on paper.”", "Data records itself, day and night"],
      ["“I don’t know what happens over the weekend.”", "The full history, with readable charts"],
      ["“Every machine has its own screen and its own program.”", "One screen for everything"],
    ],
    no: ["To replace the machines you have: we work with those.", "More sensors than needed: we only measure what matters."],
  },
  api: {
    hero: ["Your programs talk to each other. No more copy and paste.", "I connect the tools you already use, so orders, payments and customers update themselves."],
    rows: [
      ["“I retype every order from the shop into the back office.”", "They arrive by themselves, as soon as the customer pays"],
      ["“I update invoices and stock at the end of the day.”", "They update the moment something happens"],
      ["“The customer waits for a confirmation until I have time.”", "The confirmation goes out immediately, automatically"],
      ["“A typo turned into a wrong order.”", "Nobody retypes, nobody gets it wrong"],
    ],
    no: ["To make you change the programs you use.", "Connections left to fend for themselves: I monitor and update them."],
  },
  shop: {
    hero: ["An online shop that sells while you sleep.", "Catalogue, payments, shipping and stock in order. And you run it yourself."],
    rows: [
      ["“I only sell when the shop is open.”", "You sell at any hour, to people far away too"],
      ["“Carts fill up and then nobody pays.”", "Payment in one tap, no endless forms"],
      ["“I sold a product that was already out of stock.”", "Stock updates with every order"],
      ["“Changing a price means calling someone.”", "You manage products, prices and photos yourself"],
    ],
    no: ["Guaranteed sales: I make buying easy, the product and price are yours.", "Hidden cuts of your takings: they go straight to your account."],
  },
  ops: {
    hero: ["Your site always on, up to date and safe.", "Servers, backups, updates and support. If something breaks, you write to me."],
    rows: [
      ["“The site went down and a customer told me.”", "I know first, and step in right away"],
      ["“I can’t remember the last time it was updated.”", "Regular updates, without taking the site down"],
      ["“If something breaks I don’t know who to call.”", "One contact, who knows the project"],
      ["“I don’t know if a copy of my data exists.”", "A copy of everything every night, stored elsewhere"],
    ],
    no: ["Zero faults: they can happen to anyone. I promise to notice straight away and step in.", "Multi-year contracts: if you’re not happy, you can leave."],
  },
};

/** Progetti veri da mostrare come prova, solo dove c'entrano davvero. */
const PROOF: Partial<Record<ServiceKey, string[]>> = {
  web: ["creacloud", "unispace"],
  apps: ["relay"],
  design: ["relay", "unispace"],
  ai: ["creacloud"],
  api: ["creacloud", "relay"],
  ops: ["unispace", "creacloud"],
};

export function getStory(k: ServiceKey, l: Locale): ServiceStory {
  const b = { ...(l === "en" ? ENG : IT)[k], ...(l === "en" ? EXTRA_EN : EXTRA_IT)[k] };
  return build(l, b, k);
}
