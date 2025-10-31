import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import HeroPage from "./ui/pages/HeroPage";
import DiscussPage from "./ui/pages/DiscussPage";
import ContactPage from "./ui/pages/ContactPage";
import ChatPage from "./ui/pages/ChatPage";
import ChallengesPage from "./ui/pages/ChallengesPage";
import Header from "./ui/components/Header";
import SignInPage from "./ui/pages/SignInPage";
import SignUpPage from "./ui/pages/SignUpPage";

function Layout() {
  return (
    <>
      <div className="pt-[70px] box-border">
        <Header variant="primary"></Header>
        <Outlet></Outlet>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-primary">
        <Routes>
          <Route element={<Layout></Layout>}>
            <Route path="/" element={<HeroPage />}></Route>
            <Route path="/discuss" element={<DiscussPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
