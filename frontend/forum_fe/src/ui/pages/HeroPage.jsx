import { useContext, useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Introduction from "../components/Introduction";
import Stats from "../components/States";

import TopPostIntroduction from "../components/TopPostIntroduction";
import AppContext from "../Context/AppContext";
import { useNavigate } from "react-router-dom";

function HeroPage() {
  const appContext = useContext(AppContext);
  const nav = useNavigate();

  return (
    <>
      <Introduction></Introduction>
      <TopPostIntroduction></TopPostIntroduction>
      <Stats></Stats>
      
    </>
  );
}

export default HeroPage;
