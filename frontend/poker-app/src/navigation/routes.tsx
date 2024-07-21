import type { ComponentType, JSX } from "react";

import { IndexPage } from "@/pages/IndexPage/IndexPage";
import { TablePage } from "@/pages/TablePage/TablePage";
import { CreateTable } from "@/pages/CreateTable/CreateTable";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/table", Component: TablePage },
  { path: "/create_table", Component: CreateTable },
];
