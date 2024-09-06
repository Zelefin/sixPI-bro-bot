import { createRoot } from "react-dom/client";
import { Root } from "./components/Root";
import "./mockEnv.ts";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "./index.css";

import "./i18n.ts";

createRoot(document.getElementById("root")!).render(<Root />);
