import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { inject } from '@vercel/analytics';
import "./index.css";
import App from "./App";

inject();

// ── iOS Safari --vh fix ───────────────────────────────────────
// On iOS Safari the viewport height changes when the address bar
// hides/shows. We store the real innerHeight in a CSS variable.
const setVH = () => {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`,
  )
}
window.addEventListener('resize', setVH)
setVH()

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

