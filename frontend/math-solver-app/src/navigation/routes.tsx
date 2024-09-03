import type { ComponentType } from "react";

import { IndexPage } from "../pages/IndexPage";
import { HistoryPage } from "../pages/HistoryPage";
import { ProblemPage } from "../pages/ProblemPage";
import { EditPage } from "../pages/EditPage";

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/history", Component: HistoryPage },
  { path: "/problem/:id", Component: ProblemPage },
  { path: "/edit/:id", Component: EditPage },
];
