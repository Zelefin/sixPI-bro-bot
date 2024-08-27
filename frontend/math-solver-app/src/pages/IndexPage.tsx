import React from "react";
import { MathProblemsList } from "../components/MathProblemDisplay";
import { mathProblemsData } from "../components/mathProblems";

export const IndexPage: React.FC = () => {
  return <MathProblemsList problems={mathProblemsData} />;
};
