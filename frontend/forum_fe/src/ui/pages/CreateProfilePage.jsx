import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Introduction2 from "../components/Introduction2";
import CreateProfileForm from "../components/CreateProfileForm";
import { createContext, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export const CreateProfileContext = createContext();

function CreateProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <CreateProfileContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingScreen></LoadingScreen>}

      <div className="w-[90%] px-20 m-auto">
        <CreateProfileForm></CreateProfileForm>
      </div>
      <Footer></Footer>
    </CreateProfileContext.Provider>
  );
}

export default CreateProfilePage;
