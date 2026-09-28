import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LiveAnnouncerProvider } from "./accessibility/LiveAnnouncerContext.tsx";
import { App } from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LiveAnnouncerProvider>
        <App />
      </LiveAnnouncerProvider>
    </QueryClientProvider>
  </StrictMode>,
);
