import Footer from "../components/Footer";
import Header from "../components/Header";
import Introduction from "../components/Introduction";
import Stats from "../components/States";

import TopPostIntroduction from "../components/TopPostIntroduction";

function HeroPage() {
  return (
    <>
      <Introduction></Introduction>
      <TopPostIntroduction></TopPostIntroduction>
      <Stats></Stats>
      <Footer></Footer>
    </>
  );
}

export default HeroPage;
