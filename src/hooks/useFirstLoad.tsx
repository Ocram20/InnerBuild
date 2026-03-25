import { useEffect, useState } from "react";

/**
 * Hook che traccia se è il primo caricamento dell'app.
 * Usa sessionStorage per distinguere il primo accesso dalla navigazione volontaria.
 * 
 * Returns true solo al primo caricamento dell'app quando l'utente è autenticato.
 * I ricaricamenti della pagina non resettano il flag (sessionStorage persiste).
 * Solo la chiusura del tab/finestra del browser resetta il flag.
 */
export function useFirstLoad(): boolean {
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  useEffect(() => {
    const firstLoadFlag = "innerbloom_first_load_completed";
    
    // Controlla se abbiamo già completato il redirect al primo accesso
    const hasCompletedFirstLoad = sessionStorage.getItem(firstLoadFlag);
    
    if (!hasCompletedFirstLoad) {
      setIsFirstLoad(true);
      // Markers il primo caricamento come completato
      sessionStorage.setItem(firstLoadFlag, "true");
    } else {
      setIsFirstLoad(false);
    }
  }, []);

  return isFirstLoad;
}
