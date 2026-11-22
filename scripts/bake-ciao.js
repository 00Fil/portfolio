/**
 * Cuoce il "Ciao!" di vetro in due PNG (vetro e ombra): l'effetto e' pesante da calcolare ad ogni fotogramma,
 * cosi' il browser mostra solo immagini. Serve il sito in esecuzione su BASE (default http://localhost:3001).
 * Uso: node scripts/bake-ciao.js <file con il <filter> del vetro>   poi convertire i PNG in WebP (qualita 92).
 * Il filtro "ciao-glass" e' nel git: vedi la cronologia di CardViewer.tsx (commit 6f3049c).
 */
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:3001";
const filter = fs.readFileSync(process.argv[2] || "/tmp/glassfilter.svgfrag", "utf8");
const shadow = `<filter id="s" x="-6%" y="-14%" width="112%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="9" result="sb"/><feFlood flood-color="#000" flood-opacity=".62"/><feComposite in2="sb" operator="in"/></filter>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 700 }, deviceScaleFactor: 2 });
  await p.goto(BASE + "/robots.txt");
  for (const [name, def, id] of [["ciao-glass", filter.replace('id="ciao-glass"', 'id="g"'), "g"], ["ciao-shadow", shadow, "s"]]) {
    await p.evaluate(({ def, id }) => {
      document.documentElement.style.background = "transparent";
      document.body.style.cssText = "margin:0;background:transparent";
      document.body.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 1400 530" width="1400" height="530" style="display:block"><defs>${def}</defs><image href="/card/ciao.png" width="1320" height="450" filter="url(#${id})"/></svg>`;
    }, { def, id });
    await p.waitForTimeout(800);
    await p.locator("svg").screenshot({ path: `public/card/${name}.png`, omitBackground: true });
  }
  await b.close();
})();
