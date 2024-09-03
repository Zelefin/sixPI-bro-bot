export interface SolutionStep {
  explanation: string;
  formula?: string;
}

export interface Problem {
  title: string;
  problem: string;
  solution: SolutionStep[];
  conclusion: string;
}

export interface ProblemData {
  id: string;
  problem_formula: string;
  additional_info?: string;
  problem: Problem;
}

export const mockedProblemData: ProblemData =
  {
  id: "1",
  problem_formula: "x^2+y^2=0",
  additional_info: "some info",
  problem: {
    title: "Дослідження на абсолютну та умовну збіжність",
    problem: "Розглянемо ряд та дослідимо його на абсолютну та умовну збіжність:",
    solution: [
      {
        explanation: "Розглянемо ряд:",
        formula: "\\sum_{n=1}^{\\infty} (-1)^n \\frac{n}{12^n}",
      },
      {
        explanation: "1. Дослідимо ряд з абсолютних значень членів за ознакою Даламбера:",
        formula: "\\sum_{n=1}^{\\infty} \\left|(-1)^n \\frac{n}{12^n}\\right| = \\sum_{n=1}^{\\infty} \\frac{n}{12^n}",
      },
      {
        explanation: "Знайдемо відношення (n+1)-го члена до n-го:",
        formula: "\\lim_{n \\to \\infty} \\frac{a_{n+1}}{a_n} = \\lim_{n \\to \\infty} \\frac{(n+1)/12^{n+1}}{n/12^n} = \\lim_{n \\to \\infty} \\frac{n+1}{12n} = \\frac{1}{12}",
      },
      {
        explanation: "Оскільки границя менша за 1, ряд з абсолютних значень збігається.",
      },
      {
        explanation: "2. Висновок про абсолютну збіжність:",
        formula: "\\text{Ряд } \\sum_{n=1}^{\\infty} (-1)^n \\frac{n}{12^n} \\text{ абсолютно збіжний.}",
      },
      {
        explanation: "3. Оскільки ряд абсолютно збіжний, він також збіжний.",
      },
    ],
    conclusion:
      "Даний ряд є абсолютно збіжним, оскільки ряд з абсолютних значень його членів збігається. Умовна збіжність не розглядається, так як ряд вже абсолютно збіжний.",
  }
};