import { storedMaintenance } from "./admin-store";

/** Il pannello (/login) decide per primo; se non e' mai stato toccato vale MAN=1 nell'ambiente. */
export const maintenanceOn = () => storedMaintenance() ?? process.env.MAN === "1";
