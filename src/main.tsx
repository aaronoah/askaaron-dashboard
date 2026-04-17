import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Index } from "@/Index";
import "./styles.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <Index />
    </I18nProvider>
  </StrictMode>,
);
