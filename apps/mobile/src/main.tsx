import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StatusBar, Style } from "@capacitor/status-bar";
import App from "./App";
import { isNativeApp } from "./lib/platform";
import "./index.css";

async function bootstrap() {
  if (isNativeApp()) {
    document.documentElement.classList.add("capacitor-native", "app-native");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#000000" });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

void bootstrap();
