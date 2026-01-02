import { useGetChallenges } from "@/api/hooks/challengeHook";
import ChallengeList from "@/ui/components/challenge/challengeList";
import { useContext, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import PaginationInput from "../components/PaginationInput";
import type { Challenge } from "../components/challenge/mockData";
import CreateChallengeDialog from "../components/challenge/createChallengeDialog";
import AppContext from "../Context/AppContext.jsx";
import General from "@/General/General";

function ChallengesPage() {
  const [page, setPage] = useState<number>(1);
  const getChallenges = useGetChallenges(page);
  const appContext = useContext(AppContext) as any;

  useEffect(
    function () {
      if (getChallenges.isSuccess) {
        setPage((getChallenges.data as any).pagination.data);
      }
    },
    [getChallenges.data, getChallenges.isError, getChallenges.isSuccess]
  );

  if (getChallenges.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-(--view-h) px-(--primary-padding) flex flex-col py-10 space-y-5">
      {/* Stats Header */}
      <div className="">
        <h1 className="text-3xl font-bold text-foreground">
          Coding Challenges
        </h1>
      </div>

      {appContext.currentUser?.role === General.accountRoles.ADMIN && (
        <CreateChallengeDialog className="sm:max-w-none w-[80vw] h-[80vh] bg-black404040" />
      )}

      <ChallengeList
        challenges={(getChallenges.data?.data as any).map(function (
          c: any,
          i: number
        ): Challenge {
          return {
            id: c.id,
            title: c.title,
            slug: "",
            difficulty: c.difficulty,
            createAt: new Date(c.created_at),
            acceptanceRate: 0,
            status: "Solved",
            description: c.description,
            inputDescription: c.input,
            outputDescription: c.output,
            constraints: c.constraints,
            examples: [],
            time_limitation: c.time_limit,
            mem_limitation: c.memory_limit,
          };
        })}
      />

      {page > 1 && (
        <PaginationInput
          totalPages={page}
          onChange={(i: number) => setPage(i)}
          currentPage={1}
        />
      )}
    </div>
  );
}

export default ChallengesPage;
