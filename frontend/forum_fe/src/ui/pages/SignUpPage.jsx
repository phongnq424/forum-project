import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Introduction2 from "../components/Introduction2";
import SignUpForm from "../components/SignUpForm";
import LoadingScreen from "./LoadingScreen";
import { createContext, useState } from "react";

export const SignUpPageContext = createContext();

function SignUpPage() {
  return (
    <>
      <div className="flex justify-between">
        <div className="basis-[50%] px-20">
          <SignUpForm></SignUpForm>
        </div>

        <div className="basis-[55%]">
          <Introduction2></Introduction2>
        </div>
      </div>
      <Footer></Footer>
      <Outlet />
    </>
  );
}

export default SignUpPage;
