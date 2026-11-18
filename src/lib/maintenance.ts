/** Manutenzione attiva solo con MAN=1 nell'ambiente del progetto; con MAN=0 (o assente) il sito è aperto a tutti. */
export const maintenanceOn = () => process.env.MAN === "1";
