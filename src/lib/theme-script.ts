const KEY = "theme";

/**
 * Script in testa alla pagina, prima del primo disegno:
 *  - tema: quello scelto, altrimenti chiaro;
 *  - caricamento: la schermata con il nome compare solo alla prima pagina della visita; alle altre una copertura
 *    breve, del colore della pagina, che si toglie appena l'avvio ha finito il lavoro pesante (al massimo un secondo).
 */
export const INTRO_MS = 3300;
/**
 * Lingua del sistema, alla prima pagina della visita e solo se non è mai stata scelta a mano:
 * se il sistema preferisce l'altra lingua si ricarica subito la stessa pagina in quella, prima di disegnare.
 * Lingue diverse da italiano e inglese vanno in inglese. I motori di ricerca restano sull'indirizzo che chiedono.
 */
const LANG = `try{var n=navigator;if(!n.webdriver&&!/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(n.userAgent||"")&&!localStorage.getItem("lang")&&!sessionStorage.getItem("autolang")){sessionStorage.setItem("autolang","1");var L=n.languages&&n.languages.length?n.languages:[n.language||""],p="en";for(var i=0;i<L.length;i++){var c=String(L[i]||"").slice(0,2).toLowerCase();if(c==="it"||c==="en"){p=c;break}}var m=location.pathname.match(/^\\/(it|en)(\\/|$)/);if(m&&m[1]!==p){location.replace("/"+p+location.pathname.slice(3)+location.search+location.hash);return}}}catch(e){}`;
/**
 * Dispositivi lenti: poca memoria o pochi processori su Android, pochissima memoria ovunque, risparmio dati attivo,
 * oppure già misurati lenti in questa visita. Vale prima del primo disegno, così nulla di pesante parte.
 */
const PERF = `try{var nv=navigator,me=nv.deviceMemory,hc=nv.hardwareConcurrency,an=/Android/i.test(nv.userAgent||"");var pf=sessionStorage.getItem("perf");if(pf==="low"||(pf!=="high"&&((me&&me<=2)||(an&&((me&&me<=4)||(hc&&hc<=4)))||(nv.connection&&nv.connection.saveData))))d.dataset.perf="low"}catch(e){}`;
export const THEME_SCRIPT = `(function(){var d=document.documentElement;${PERF}${LANG}try{var t=localStorage.getItem("${KEY}");d.dataset.theme=t==="dark"?"dark":"light"}catch(e){d.dataset.theme="light"}try{if(!sessionStorage.getItem("intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="run";sessionStorage.setItem("intro","1");window.__introEnd=performance.now()+${INTRO_MS}}else if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="quick"}}catch(e){}})()`;
