import { createContext, useState } from "react";
import Footer from "../components/Footer";
import Introduction2 from "../components/Introduction2";
import SignInForm from "../components/SignInForm";
import LoadingScreen from "./LoadingScreen";

export const SignInContext = createContext();

function SignInPage() {
  return (
    <>
      <div className="flex justify-between">
        <div className="basis-[50%] px-20">
          <SignInForm></SignInForm>
        </div>

        <div className="basis-[55%]">
          <Introduction2></Introduction2>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}

export default SignInPage;
