import { useContext, useEffect, useState } from "react";
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
import LoadingScreen from "../pages/LoadingScreen";
import toastHelper from "../../helper/ToastHelper";
import {
  useGetMySubmissionsByChallenge,
  useSubmitCode,
} from "@/api/hooks/submissionHook";
import SubmissionCard from "../components/challenge/submissionCard";
import AppContext from "../Context/AppContext.jsx";

export default function DetailChallengeSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getChallengeById = useGetChallengeById(id ?? "");
  const submitCode = useSubmitCode();
  const appContext = useContext(AppContext) as any;
  const getMySubmissionByChallenge = useGetMySubmissionsByChallenge(
    id ?? "",
    appContext?.currentUser?.user_id
  );

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

  useEffect(
    function () {
      if (submitCode.isSuccess) {
        console.log("Submission Response", submitCode.data);
      }

      if (submitCode.isError) {
      }
    },
    [submitCode.data, submitCode.isSuccess, submitCode.isError]
  );

  useEffect(
    function () {
      if (getMySubmissionByChallenge.isSuccess) {
      }
    },
    [
      getMySubmissionByChallenge.data,
      getMySubmissionByChallenge.isError,
      getMySubmissionByChallenge.isSuccess,
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

  if (submitCode.isPending) {
    return <LoadingScreen />;
  }

  const handleSubmit = (code: string, languageId: string) => {
    submitCode.mutate({
      challengeId: id ?? "",
      code: code,
      languageId: languageId,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="h-(--view-h) flex flex-col space-y-10 bg-transparent px-(--primary-padding)">
        {/* Split Pane */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Problem Description Panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="h-full bg-transparent flex flex-col space-y-1 pr-5 overflow-auto">
                <ProblemDescription challenge={challenge} />
                <h1 className="font-bold text-xl">Your Submissions</h1>
                <div className="flex flex-col space-y-4 py-5 px-20 bg-white/10 rounded-xl">
                  {getMySubmissionByChallenge.data?.map(function (
                    s: any,
                    i: number
                  ) {
                    return (
                      <SubmissionCard
                        key={s.id}
                        id={s.id}
                        submittedAt={new Date(s.submitted_at).toLocaleString()}
                        status={s.status}
                        score={s.score}
                        onClick={(id) => alert(id)}
                        code={""}
                        languageName={""}
                      ></SubmissionCard>
                    );
                  })}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-1.5 bg-black hover:bg-white/5 transition-colors" />

            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={55} minSize={35}>
              <div className="h-full p-4">
                <CodeEditor onSubmit={handleSubmit} />
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
