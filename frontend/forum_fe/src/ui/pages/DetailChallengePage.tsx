import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ProblemDescription } from "@/ui/components/challenge//problemDescription";
import { CodeEditor } from "@/ui/components/challenge/codeEditor";
import { SubmitModal } from "@/ui/components/challenge/submitModel";
import {
  challenges,
  sampleSubmission,
} from "@/ui/components/challenge/mockData";

export default function DetailChallengePage() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submission, setSubmission] = useState(sampleSubmission);
  const challenge = challenges.find((c) => c.id == id);

  if (!challenge) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Challenge not found
          </h1>
        </div>
      </div>
    );
  }

  const handleRun = () => {
    console.log("Running code...");
    // Mock run functionality
  };

  const handleSubmit = () => {
    // Randomly select a status for demo
    const statuses = [
      "Accepted",
      "Wrong Answer",
      "Runtime Error",
      "Time Limit Exceeded",
    ] as const;
    const randomStatus =
      statuses[Math.floor(Math.random() * statuses.length)] ?? "Wrong Answer";

    setSubmission({
      ...sampleSubmission,
      status: randomStatus,
      challengeId: challenge.id,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="h-(--view-h) flex flex-col bg-transparent px-(--primary-padding)">
        {/* Split Pane */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Problem Description Panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="h-full bg-transparent border-r border-border">
                <ProblemDescription challenge={challenge} />
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-black hover:bg-white/5 transition-colors" />

            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={55} minSize={35}>
              <div className="h-full p-4">
                <CodeEditor onRun={handleRun} onSubmit={handleSubmit} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Submit Modal */}
        <SubmitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          submission={submission}
        />
      </div>
    </>
  );
}
