import { initClosingBehavior } from "@telegram-apps/sdk-react";
import type { FC } from "react";

export const TablePage: FC = () => {
  const [closingBehavior] = initClosingBehavior();
  closingBehavior.enableConfirmation();

  return (
    <>
      <p>welcome to the table</p>
    </>
  );
};
