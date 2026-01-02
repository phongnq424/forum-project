import { CheckCircle, XCircle } from "lucide-react";
import type { TestCase } from "./mockData";
import { cn } from "@/lib/utils";

interface TestCaseResultProps {
  testCase: TestCase;
  index: number;
}

export function TestCaseResult({ testCase, index }: TestCaseResultProps) {
  const isPassing = testCase.status === "Pass";

  return (
    <div
      className={cn(
        "p-4 rounded-lg border animate-fade-in",
        isPassing ? "bg-easy/5 border-easy/30" : "bg-hard/5 border-hard/30"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-foreground">
          Test Case {testCase.id}
        </span>
        <div className="flex items-center gap-2">
          {isPassing ? (
            <>
              <CheckCircle className="w-5 h-5 text-easy" />
              <span className="text-sm font-medium text-easy">Pass</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-hard" />
              <span className="text-sm font-medium text-hard">Fail</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="p-3 bg-background rounded-md">
          <div className="text-muted-foreground mb-1">Input</div>
          <code className="font-mono text-foreground">{testCase.input}</code>
        </div>

        <div className="p-3 bg-background rounded-md">
          <div className="text-muted-foreground mb-1">Expected Output</div>
          <code className="font-mono text-foreground">
            {testCase.expectedOutput}
          </code>
        </div>

        <div
          className={cn(
            "p-3 rounded-md",
            isPassing ? "bg-easy/10" : "bg-hard/10"
          )}
        >
          <div className="text-muted-foreground mb-1">Actual Output</div>
          <code
            className={cn("font-mono", isPassing ? "text-easy" : "text-hard")}
          >
            {testCase.actualOutput}
          </code>
        </div>
      </div>
    </div>
  );
}
