import type { Locale } from "@/i18n/routing";
import type { ServiceKey } from "./services";

/**
 * Un disegno per ogni voce di "cosa include", nello stesso ordine.
 * Pochi tipi di scena, contenuti diversi: flusso, spunte, nodo con satelliti, prima/dopo, schermo, misura, chat.
 */
type T = [string, string];
export type Scene =
  | { kind: "flow"; items: T[] }
  | { kind: "check"; items: T[] }
  | { kind: "orbit"; center: T; items: T[] }
  | { kind: "compare"; before: T[]; after: T[] }
  | { kind: "screen"; device: "desktop" | "phone"; title: T; rows: T[] }
  | { kind: "meter"; value: string; label: T; bars: number[] }
  | { kind: "chat"; q: T; a: T };

export const tr = (t: T, l: Locale) => (l === "it" ? t[0] : t[1]);

export const STORIES: Record<ServiceKey, Scene[]> = {
  web: [
    { kind: "screen", device: "desktop", title: ["La tua azienda, online", "Your company, online"], rows: [["Chi siamo", "About"], ["Servizi", "Services"], ["Contatti", "Contact"]] },
    { kind: "flow", items: [["Richiesta", "Request"], ["Approvazione", "Approval"], ["Fattura", "Invoice"], ["Archivio", "Archive"]] },
    { kind: "orbit", center: ["I tuoi dati", "Your data"], items: [["Clienti", "Customers"], ["Ordini", "Orders"], ["Permessi", "Roles"], ["Backup", "Backups"]] },
    { kind: "check", items: [["Testi", "Text"], ["Immagini", "Images"], ["Prodotti", "Products"], ["Nuove pagine", "New pages"]] },
  ],
  seo: [
    { kind: "meter", value: "100", label: ["Prestazioni secondo Google", "Performance by Google"], bars: [0.46, 0.32, 0.2] },
    { kind: "check", items: [["Mappa del sito", "Sitemap"], ["Indirizzi puliti", "Clean URLs"], ["Versioni in più lingue", "Language versions"], ["Pagine indicizzate", "Indexed pages"]] },
    { kind: "orbit", center: ["Google", "Google"], items: [["Stelle e recensioni", "Stars and reviews"], ["Prezzi", "Prices"], ["Orari", "Opening hours"], ["Domande frequenti", "FAQ"]] },
    { kind: "flow", items: [["Ricerca vicino a te", "Search near you"], ["Scheda Google", "Google profile"], ["Il tuo sito", "Your site"], ["Chiamata", "Call"]] },
  ],
  geo: [
    { kind: "compare", before: [["Testi lunghi e vaghi", "Long, vague copy"], ["Nessuna fonte", "No sources"]], after: [["Risposta in apertura", "Answer up front"], ["Dati con la fonte", "Facts with sources"]] },
    { kind: "orbit", center: ["AI", "AI"], items: [["Chi sei", "Who you are"], ["Cosa fai", "What you do"], ["Dove", "Where"], ["Prezzi", "Prices"]] },
    { kind: "check", items: [["Indice per le AI", "Index for AI"], ["Crawler autorizzati", "Allowed crawlers"], ["Pagine chiave", "Key pages"]] },
    { kind: "flow", items: [["ChatGPT", "ChatGPT"], ["Gemini", "Gemini"], ["Perplexity", "Perplexity"], ["Report", "Report"]] },
  ],
  apps: [
    { kind: "screen", device: "phone", title: ["La tua app", "Your app"], rows: [["Prenotazioni", "Bookings"], ["Messaggi", "Messages"], ["Profilo", "Profile"]] },
    { kind: "screen", device: "desktop", title: ["Anche sul computer", "On desktop too"], rows: [["Archivio", "Archive"], ["Notifiche", "Notifications"], ["Impostazioni", "Settings"]] },
    { kind: "flow", items: [["Telefono", "Phone"], ["Server", "Server"], ["Computer", "Computer"]] },
    { kind: "check", items: [["Versioni di prova", "Test builds"], ["Pubblicazione sugli store", "Store release"], ["Aggiornamenti", "Updates"]] },
  ],
  design: [
    { kind: "flow", items: [["Chi lo usa", "Who uses it"], ["Per fare cosa", "To do what"], ["In quanti passaggi", "In how many steps"]] },
    { kind: "screen", device: "phone", title: ["Prototipo", "Prototype"], rows: [["Accedi", "Sign in"], ["Scegli", "Choose"], ["Conferma", "Confirm"]] },
    { kind: "orbit", center: ["Sistema", "System"], items: [["Colori", "Colours"], ["Testi", "Type"], ["Componenti", "Components"], ["Animazioni", "Motion"]] },
    { kind: "check", items: [["Contrasti", "Contrast"], ["Tastiera", "Keyboard"], ["Lettori di schermo", "Screen readers"]] },
  ],
  ai: [
    { kind: "flow", items: [["Email", "Email"], ["L’AI legge", "AI reads"], ["Gestionale", "Back office"], ["Cliente", "Customer"]] },
    { kind: "chat", q: ["Giovedì posso alle 17 invece che alle 15?", "Can I come Thursday at 5 instead of 3?"], a: ["Fatto: lezione spostata a giovedì alle 17.", "Done: lesson moved to Thursday at 5."] },
    { kind: "compare", before: [["Dati copiati a mano", "Data typed by hand"], ["Errori e ritardi", "Errors and delays"]], after: [["Letti dall’AI", "Read by AI"], ["Controllati e registrati", "Checked and logged"]] },
    { kind: "check", items: [["Approvazione di una persona", "Human approval"], ["Registro di ogni passo", "Log of every step"], ["Dati sui tuoi server", "Data on your servers"]] },
  ],
  hw: [
    { kind: "flow", items: [["Idea", "Idea"], ["Prototipo", "Prototype"], ["Installazione", "Installation"]] },
    { kind: "orbit", center: ["Sensore", "Sensor"], items: [["Temperatura", "Temperature"], ["Presenza", "Presence"], ["Consumi", "Energy"], ["Accessi", "Access"]] },
    { kind: "meter", value: "4,1 °C", label: ["Cella frigo · in tempo reale", "Cold room · live"], bars: [0.4, 0.55, 0.45] },
    { kind: "flow", items: [["Macchina", "Machine"], ["Server", "Server"], ["Gestionale", "Back office"], ["Avviso", "Alert"]] },
  ],
  api: [
    { kind: "orbit", center: ["Gestionale", "Back office"], items: [["App", "App"], ["Sito", "Website"], ["Partner", "Partners"], ["Magazzino", "Warehouse"]] },
    { kind: "flow", items: [["Pagamento", "Payment"], ["Fattura", "Invoice"], ["Email al cliente", "Customer email"]] },
    { kind: "check", items: [["Contatti", "Contacts"], ["Appuntamenti", "Appointments"], ["Email", "Email"]] },
    { kind: "flow", items: [["Evento", "Event"], ["Nuovo tentativo", "Retry"], ["Registrato", "Logged"]] },
  ],
  shop: [
    { kind: "orbit", center: ["Prodotto", "Product"], items: [["Taglie", "Sizes"], ["Colori", "Colours"], ["Disponibilità", "Stock"], ["Foto", "Photos"]] },
    { kind: "screen", device: "phone", title: ["Checkout", "Checkout"], rows: [["Apple Pay", "Apple Pay"], ["Google Pay", "Google Pay"], ["Carta", "Card"]] },
    { kind: "flow", items: [["Ordine", "Order"], ["Pagato", "Paid"], ["Spedito", "Shipped"], ["Consegnato", "Delivered"]] },
    { kind: "check", items: [["Schede prodotto", "Product pages"], ["Google Shopping", "Google Shopping"], ["Recensioni", "Reviews"]] },
  ],
  ops: [
    { kind: "check", items: [["Server dedicato", "Dedicated server"], ["Lucchetto di sicurezza", "Security padlock"], ["Il tuo dominio", "Your domain"]] },
    { kind: "flow", items: [["Modifica", "Change"], ["Controlli automatici", "Automatic checks"], ["Online", "Live"]] },
    { kind: "meter", value: "99,98%", label: ["Tempo online", "Uptime"], bars: [0.98, 0.99, 1] },
    { kind: "check", items: [["Aggiornamenti di sicurezza", "Security updates"], ["Nuove funzioni", "New features"], ["Risposte rapide", "Quick answers"]] },
  ],
};
