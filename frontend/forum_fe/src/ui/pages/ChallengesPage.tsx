import { useGetChallenges } from "@/api/hooks/challengeHook";
import ChallengeList, {
  type Challenge,
} from "@/ui/components/challenge/challengeList";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import PaginationInput from "../components/PaginationInput";

function ChallengesPage() {
  const [page, setPage] = useState<number>(1);
  const getChallenges = useGetChallenges(page);

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
    <div className="h-(--view-h) px-(--primary-padding) flex flex-col py-2">
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
          totalPages={10}
          onChange={(i: number) => alert(i)}
          currentPage={1}
        />
      )}
    </div>
  );
}

export default ChallengesPage;
