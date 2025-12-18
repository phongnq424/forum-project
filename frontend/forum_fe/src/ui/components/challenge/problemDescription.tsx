import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "./difficultyBadge";
import type { Challenge } from "./mockData";

interface ProblemDescriptionProps {
  challenge: Challenge;
}

export function ProblemDescription({ challenge }: ProblemDescriptionProps) {
  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-2xl">
          <span className="text-muted-foreground">#{challenge.id}</span>
          <h1 className=" font-bold text-foreground">{challenge.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={challenge.difficulty} />
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-invert max-w-none">
        <div className="text-foreground whitespace-pre-wrap leading-relaxed">
          {challenge.description}
        </div>
      </div>

      {/* Examples */}
      {/* <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Examples</h2>
        {challenge.examples.map((example, index) => (
          <div
            key={index}
            className="p-4 bg-muted rounded-lg border border-border space-y-3"
          >
            <div className="text-sm font-medium text-muted-foreground">
              Example {index + 1}
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-foreground">
                  Input:{" "}
                </span>
                <code className="font-mono text-sm text-primary bg-background px-2 py-1 rounded">
                  {example.input}
                </code>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  Output:{" "}
                </span>
                <code className="font-mono text-sm text-primary bg-background px-2 py-1 rounded">
                  {example.output}
                </code>
              </div>
              {example.explanation && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Explanation: </span>
                  {example.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div> */}

      <div className="p-4 bg-white/10 rounded-2xl flex flex-col space-y-4">
        {/* Input */}
        <div className="prose prose-invert max-w-none">
          <h1 className="text-lg font-semibold text-foreground">Input</h1>
          <div className="text-foreground whitespace-pre-wrap leading-relaxed">
            {challenge.inputDescription}
          </div>
        </div>

        {/* Output */}
        <div className="prose prose-invert max-w-none">
          <h1 className="text-lg font-semibold text-foreground">Output</h1>
          <div className="text-foreground whitespace-pre-wrap leading-relaxed">
            {challenge.outputDescription}
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Constraints</h2>
          <ul className="list-disc list-inside space-y-1">
            {challenge.constraints.map((constraint, index) => (
              <li key={index} className="text-muted-foreground">
                <code className="font-mono text-sm text-foreground">
                  {constraint}
                </code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
