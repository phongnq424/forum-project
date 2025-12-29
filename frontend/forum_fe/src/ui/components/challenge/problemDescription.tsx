import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "./difficultyBadge";
import type { Challenge } from "./mockData";
import { Cpu, Hourglass } from "lucide-react";

interface ProblemDescriptionProps {
  challenge: Challenge;
}

export function ProblemDescription({ challenge }: ProblemDescriptionProps) {
  return (
    <div className="flex-1 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col items-start gap-3 text-2xl">
          <p className="text-muted-foreground text-sm">#{challenge.id}</p>
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
            {challenge.constraints.split(/[,;\n]+/).map((constraint, index) => (
              <li key={index} className="text-muted-foreground">
                <code className="font-mono text-sm text-foreground">
                  {constraint}
                </code>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitation */}

        <div className="space-x-3 flex items-center">
          <h2 className="text-lg font-semibold text-foreground">Limitation</h2>
          <div className="flex space-x-4 flex-1">
            <div className="flex-1 h-10 bg-black rounded-xl px-2 py-1 flex items-center justify-center space-x-2">
              <Cpu></Cpu>
              <p className="text-sm"> {challenge.mem_limitation} MB</p>
            </div>
            <div className="flex-1 h-10 bg-black rounded-xl px-2 py-1 flex items-center justify-center space-x-2">
              <Hourglass></Hourglass>
              <p className="text-sm"> {challenge.time_limitation} ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
