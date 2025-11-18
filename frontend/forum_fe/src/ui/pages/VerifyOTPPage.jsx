import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Introduction2 from "../components/Introduction2";
import VerifyOTPForm from "../components/VerifyOTPForm";
import { createContext, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export const VerifyOTPContext = createContext();

function VerifyOTPPage() {
  const location = useLocation();
  const email = location.state?.email || "";
  console.log(email);

  return (
    <>
      <div className="flex justify-between">
        <div className="basis-[50%] px-20">
          <VerifyOTPForm email={email}></VerifyOTPForm>
        </div>

        <div className="basis-[55%]">
          <Introduction2></Introduction2>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}

export default VerifyOTPPage;
