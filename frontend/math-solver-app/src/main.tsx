import { createRoot } from "react-dom/client";
import { Root } from "./components/Root.tsx";
import "./mockEnv.ts";

import "@telegram-apps/telegram-ui/dist/styles.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<Root />);
