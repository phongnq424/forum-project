import { Outlet, Route, Routes } from "react-router-dom";
import Header from "../ui/components/Header";
import HeroPage from "../ui/pages/HeroPage";
import DiscussPage from "../ui/pages/DiscussPage";
import ContactPage from "../ui/pages/ContactPage";
import ChatPage from "../ui/pages/ChatPage";
import ChallengesPage from "../ui/pages/ChallengesPage.tsx";
import SignInPage from "../ui/pages/SignInPage";
import SignUpPage from "../ui/pages/SignUpPage";
import VerifyOTPPage from "../ui/pages/VerifyOTPPage";
import { useContext } from "react";
import AppContext from "../ui/Context/AppContext";
import CreateProfilePage from "../ui/pages/CreateProfilePage";
import DetailPostPage from "../ui/pages/DetailPostPage";
import ProfilePage from "../ui/pages/ProfilePage";
import UpdateProfilePage from "../ui/pages/UpdateProfilePage";
import Footer from "../ui/components/Footer";
import ScrollToTop from "../ui/components/ScrollToTop";
import DetailChallengeSubmissionPage from "../ui/pages/DetailChallengeSubmissionPage.tsx";
import DetailChallengePage from "../ui/pages/DetailChallengePage.tsx";

function Layout() {
  const appContext = useContext(AppContext);
  return (
    <>
      <div className="box-border">
        <Header variant="primary"></Header>
        <div className="mt-[70px] pb-10 min-h-(--view-h)">
          <Outlet></Outlet>
        </div>
        <Footer></Footer>
      </div>
    </>
  );
}

function PageRouters() {
  return (
    <>
      <ScrollToTop />
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
          <Route path="/post-detail" element={<DetailPostPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/update-profile" element={<CreateProfilePage />} />
          <Route path="/challenges/:id" element={<DetailChallengePage />} />
          <Route
            path="/challenges/:id/submission"
            element={<DetailChallengeSubmissionPage />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default PageRouters;
