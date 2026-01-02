import {
  useDeleteChallenge,
  useGetChallengeById,
} from "@/api/hooks/challengeHook";
import { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import type { Challenge } from "../components/challenge/mockData";
import toastHelper from "../../helper/ToastHelper";
import { ProblemDescription } from "../components/challenge/problemDescription";
import { useGetLeaderBoardByChallengeId } from "@/api/hooks/leaderBoardHook";
import { LeaderboardItem } from "../components/leaderboard/leaderboardItem";
import AppContext from "../Context/AppContext.jsx";
import General from "@/General/General";
import { useUploadTestcase } from "@/api/hooks/testcaseHook";
import UploadFileDialog from "../components/challenge/uploadTestcaseDialog";

const DetailChallengePage = function () {
  const { id } = useParams<{ id: string }>();
  const getChallengeById = useGetChallengeById(id ?? "");
  const [challenge, setChallenge] = useState<Challenge>();
  const getLeaderboardByChallengeId = useGetLeaderBoardByChallengeId(id ?? "");
  const appContext = useContext(AppContext) as any;
  const uploadTestcase = useUploadTestcase();
  const deleteChallenge = useDeleteChallenge();
  const navigate = useNavigate();
  const [uploadTestcaseDialogOpen, setUploadTestcaseDialogOpen] =
    useState(false);
  useEffect(
    function () {
      if (uploadTestcase.isSuccess) {
        toastHelper.success("Upload testcase successfully");
      }

      if (uploadTestcase.isError) {
        toastHelper.error(uploadTestcase.error.message);
      }
    },
    [uploadTestcase.isError, uploadTestcase.isSuccess, uploadTestcase.data]
  );

  useEffect(
    function () {
      if (getChallengeById.isSuccess) {
        setChallenge({
          id: (getChallengeById.data as any)?.id,
          title: (getChallengeById.data as any)?.title,
          slug: "",
          difficulty: (getChallengeById.data as any)?.difficulty,
          createAt: new Date((getChallengeById.data as any)?.created_at),
          acceptanceRate: 0,
          status: "Solved",
          description: (getChallengeById.data as any)?.description,
          inputDescription: (getChallengeById.data as any)?.input,
          outputDescription: (getChallengeById.data as any)?.output,
          constraints: (getChallengeById.data as any)?.constraints,
          examples: [],
          time_limitation: (getChallengeById.data as any)?.time_limit,
          mem_limitation: (getChallengeById.data as any)?.memory_limit,
          testcase: (getChallengeById.data as any)?.Testcase,
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
      if (deleteChallenge.isSuccess) {
        toastHelper.success("Delete challenge successfully");
        navigate("/challenges");
      }

      if (deleteChallenge.isError) {
        toastHelper.success(deleteChallenge.error.message);
      }
    },
    [deleteChallenge.data, deleteChallenge.isSuccess, deleteChallenge.isError]
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

  return (
    <div className="h-(--view-h) flex justify-between bg-transparent px-(--primary-padding) py-3">
      <UploadFileDialog
        open={uploadTestcaseDialogOpen}
        setOpen={setUploadTestcaseDialogOpen}
        handleOnUpload={function (f: File): void {
          if (!id || !f) {
            toastHelper.error("Please select one file");
            return;
          }
          uploadTestcase.mutate({
            challengeId: id ?? "",
            file: f,
          });
        }}
      />
      <div className="flex flex-col space-y-5 bg-transparent h-full overflow-y-auto py-3 pr-3 basis-[60%]">
        <div className="bg-transparent flex flex-col space-y-1">
          <ProblemDescription challenge={challenge} />
        </div>

        <NavLink
          className="rounded-xl py-2 self-stretch text-lg text-white bg-proPurple hover:opacity-80 flex justify-center font-semibold mt-4 h-fit"
          to={`/challenges/${id}/submission`}
        >
          Try Submitting
        </NavLink>

        {appContext.currentUser?.role === General.accountRoles.ADMIN && (
          <div className="flex space-x-10 w-full">
            <div className="w-full flex-1">
              <button
                className="flex-col flex-1 rounded-xl py-2 w-full self-stretch text-lg text-white bg-proPurple hover:opacity-80 flex justify-center font-semibold disabled:cursor-not-allowed"
                onClick={() => setUploadTestcaseDialogOpen(true)}
              >
                {(challenge?.testcase ?? []).length <= 0 && (
                  <>
                    <p>Add Testcase</p>
                    <p className="text-sm font-light">
                      There is no testcase now
                    </p>
                  </>
                )}

                {(challenge?.testcase ?? []).length > 0 && (
                  <>
                    <p>Update Testcase</p>
                    <p className="text-sm font-light">
                      Change this challenge's testcase
                    </p>
                  </>
                )}
              </button>
            </div>

            <button
              className="rounded-xl flex-1 py-2 self-stretch text-lg text-white bg-red-500 hover:opacity-80 flex justify-center font-semibold items-center"
              onClick={function (e) {
                deleteChallenge.mutate({ id: id ?? "" });
              }}
            >
              Delete Challenge
            </button>

            {}
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-5 basis-[40%] bg-transparent h-full overflow-y-auto px-10">
        <h1 className="font-semibold text-xl">Leaderboard</h1>
        {(getLeaderboardByChallengeId as any).data?.length <= 0 && (
          <h1 className="text-white">
            There is nobody tried submitting this challenge
          </h1>
        )}
        {(getLeaderboardByChallengeId as any).data?.length > 0 &&
          (getLeaderboardByChallengeId as any).data.map(function (
            lb: any,
            i: number
          ) {
            const data = {
              rank: lb.rank,
              username: lb.User?.username,
              fullname: lb.User?.Profile?.fullname,
              score: lb.score,
              avatar: lb.User?.Profile?.avatar,
              userId: lb.user_id,
            };

            return <LeaderboardItem {...data} key={data.userId} />;
          })}
      </div>
    </div>
  );
};

export default DetailChallengePage;
