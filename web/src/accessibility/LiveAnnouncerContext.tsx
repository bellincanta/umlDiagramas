import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface LiveAnnouncerContextValue {
  announce: (message: string) => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextValue | null>(null);

/**
 * Região aria-live global. Necessária porque a tela não tem um foco visual
 * óbvio para confirmações/erros de ações assíncronas (criar/remover
 * elementos) — sem isso, um usuário de leitor de tela não saberia se a ação
 * funcionou.
 */
export function LiveAnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<number | undefined>(undefined);

  const announce = useCallback((next: string) => {
    window.clearTimeout(timeoutRef.current);
    // Limpa antes de definir a nova mensagem: se o texto for idêntico ao
    // anterior, o leitor de tela não percebe a mudança e não anuncia de novo.
    setMessage("");
    timeoutRef.current = window.setTimeout(() => setMessage(next), 50);
  }, []);

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      <div aria-live="polite" role="status" className="visually-hidden">
        {message}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

export function useLiveAnnouncer(): LiveAnnouncerContextValue {
  const context = useContext(LiveAnnouncerContext);
  if (!context) {
    throw new Error("useLiveAnnouncer deve ser usado dentro de um LiveAnnouncerProvider.");
  }
  return context;
}
