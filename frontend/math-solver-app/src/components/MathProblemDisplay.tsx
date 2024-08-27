// MathProblemDisplay.tsx

import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { SolutionStep, MathProblem } from "./mathProblems";

interface LatexProps {
  formula: string;
}

const Latex: React.FC<LatexProps> = ({ formula }) => {
  const renderLatex = (): { __html: string } => ({
    __html: katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
    }),
  });

  return <span dangerouslySetInnerHTML={renderLatex()} />;
};

const SolutionStepDisplay: React.FC<SolutionStep> = ({
  explanation,
  formula,
}) => (
  <div className="my-2">
    <p>{explanation}</p>
    {formula && (
      <div className="my-2 overflow-auto">
        <Latex formula={formula} />
      </div>
    )}
  </div>
);

const MathProblemDisplay: React.FC<MathProblem> = ({
  title,
  problem,
  solution,
  conclusion,
}) => (
  <div className="mb-6 text-tg-text-color">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="mb-2">{problem}</p>
    {solution.map((step, index) => (
      <SolutionStepDisplay key={index} {...step} />
    ))}
    <p className="mt-2 font-semibold">Висновок: {conclusion}</p>
  </div>
);

interface MathProblemsListProps {
  problems: MathProblem[];
}

export const MathProblemsList: React.FC<MathProblemsListProps> = ({
  problems,
}) => (
  <div className="p-4 rounded shadow">
    <h2 className="text-xl text-tg-text-color font-bold mb-4">
      Математичні задачі
    </h2>
    {problems.map((problem, index) => (
      <MathProblemDisplay key={index} {...problem} />
    ))}
  </div>
);
