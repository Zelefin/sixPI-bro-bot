import React from "react";
import "katex/dist/katex.min.css";
import { SolutionStep, ProblemData } from "./problemTypes";
import { Latex } from "./Latex";

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

export const MathProblemDisplay: React.FC<{ problem: ProblemData }> = ({
  problem,
}) => (
  <div className="p-4 text-tg-text-color">
    <h3 className="text-lg font-semibold mb-2">{problem.problem.title}</h3>
    <p className="mb-2">{problem.problem.problem}</p>
    {problem.problem.solution.map((step, index) => (
      <SolutionStepDisplay key={index} {...step} />
    ))}
    <p className="mt-2 font-semibold">Висновок: {problem.problem.conclusion}</p>
  </div>
);
