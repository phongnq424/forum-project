import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ProblemDescription } from "@/ui/components/challenge//problemDescription";
import { CodeEditor } from "@/ui/components/challenge/codeEditor";
import { SubmitModal } from "@/ui/components/challenge/submitModel";
import { type Challenge } from "@/ui/components/challenge/mockData";
import { useGetChallengeById } from "@/api/hooks/challengeHook";

import toastHelper from "../../helper/ToastHelper";

export default function DetailChallengePage() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getChallengeById = useGetChallengeById(id ?? "");

  const [challenge, setChallenge] = useState<Challenge>();
  useEffect(
    function () {
      if (getChallengeById.isSuccess) {
        setChallenge({
          id: (getChallengeById.data as any).id,
          title: (getChallengeById.data as any).title,
          slug: "",
          difficulty: (getChallengeById.data as any).difficulty,
          createAt: new Date((getChallengeById.data as any).created_at),
          acceptanceRate: 0,
          status: "Solved",
          description: (getChallengeById.data as any).description,
          inputDescription: (getChallengeById.data as any).input,
          outputDescription: (getChallengeById.data as any).output,
          constraints: (getChallengeById.data as any).constraints,
          examples: [],
          time_limitation: (getChallengeById.data as any).time_limit,
          mem_limitation: (getChallengeById.data as any).memory_limit,
        });
      }
      if (getChallengeById.error) {
        toastHelper.error(getChallengeById.error.message);
      }
    },
    [
      getChallengeById.data,
      getChallengeById.isSuccess,
      getChallengeById.isError,
    ]
  );

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
        {/* <SubmitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          submission={submission}
        /> */}
      </div>
    </>
  );
}
