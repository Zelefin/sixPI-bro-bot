import type { ComponentType } from "react";

import { IndexPage } from "./pages/IndexPage";
import { LearningPage } from "./pages/LearningPage";

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/learn", Component: LearningPage },
];
