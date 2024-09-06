import { useTranslation } from "react-i18next";

export const IndexPage: React.FC = () => {
  const { t } = useTranslation();

  return <div>{t("welcome")}</div>;
};
