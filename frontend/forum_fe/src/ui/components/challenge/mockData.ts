export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Solved" | "Attempted" | "Not Started";
export type Language = {
  id: string;
  name: string;
  code: string;
};

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: "Pass" | "Fail";
}

export interface Challenge {
  id: number | string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  createAt: Date;

  acceptanceRate: number;
  status: Status;
  description: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  time_limitation: number;
  mem_limitation: number;
}

export interface Submission {
  id: number;
  challengeId: number | string;
  code: string;
  language: Language;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded";
  runtime: string;
  memory: string;
  submittedAt: string;
  testCases: TestCase[];
}
