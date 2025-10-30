import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import HeroPage from "./ui/pages/HeroPage";
import DiscussPage from "./ui/pages/DiscussPage";
import ContactPage from "./ui/pages/ContactPage";
import ChatPage from "./ui/pages/ChatPage";
import ChallengesPage from "./ui/pages/ChallengesPage";
import Header from "./ui/components/Header";

function Layout() {
  return (
    <>
      <Header variant="primary"></Header>
      <div className="pt-[70px]">
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
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
