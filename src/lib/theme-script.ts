const KEY = "theme";

/**
 * Script in testa alla pagina, prima del primo disegno:
 *  - tema: quello scelto, altrimenti chiaro;
 *  - caricamento: la schermata con il nome compare solo alla prima pagina della visita; alle altre una copertura
 *    breve, del colore della pagina, che si toglie appena l'avvio ha finito il lavoro pesante (al massimo un secondo).
 */
export const INTRO_MS = 3300;
export const THEME_SCRIPT = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("${KEY}");d.dataset.theme=t==="dark"?"dark":"light"}catch(e){d.dataset.theme="light"}try{if(!sessionStorage.getItem("intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="run";sessionStorage.setItem("intro","1");window.__introEnd=performance.now()+${INTRO_MS}}else if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="quick"}}catch(e){}})()`;
