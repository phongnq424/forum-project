import { Outlet, Route, Routes } from "react-router-dom";
import Header from "../ui/components/Header";
import HeroPage from "../ui/pages/HeroPage";
import DiscussPage from "../ui/pages/DiscussPage";
import ContactPage from "../ui/pages/ContactPage";
import ChatPage from "../ui/pages/ChatPage";
import ChallengesPage from "../ui/pages/ChallengesPage";
import SignInPage from "../ui/pages/SignInPage";
import SignUpPage from "../ui/pages/SignUpPage";
import VerifyOTPPage from "../ui/pages/VerifyOTPPage";
import LoadingScreen from "../ui/pages/LoadingScreen";
import { useContext } from "react";
import AppContext from "../ui/Context/AppContext";
import CreateProfilePage from "../ui/pages/CreateProfilePage";

function Layout() {
  const appContext = useContext(AppContext);
  return (
    <>
      <div className="pt-[70px] box-border">
        {appContext.isLoading && <LoadingScreen />}
        <Header variant="primary"></Header>
        <Outlet></Outlet>
      </div>
    </>
  );
}

function PageRouters() {
  return (
    <Routes>
      <Route element={<Layout></Layout>}>
        <Route path="/" element={<HeroPage />}></Route>
        <Route path="/discuss" element={<DiscussPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-up/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />
      </Route>
    </Routes>
  );
}

export default PageRouters;
