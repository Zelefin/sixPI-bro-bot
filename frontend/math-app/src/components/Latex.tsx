import katex from "katex";

interface LatexProps {
  formula: string;
}

export const Latex: React.FC<LatexProps> = ({ formula }) => {
  const renderLatex = (): { __html: string } => ({
    __html: katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
    }),
  });

  return <span dangerouslySetInnerHTML={renderLatex()} />;
};
