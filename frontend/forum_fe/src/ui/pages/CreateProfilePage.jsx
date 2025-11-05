import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Introduction2 from "../components/Introduction2";
import CreateProfileForm from "../components/CreateProfileForm";

function CreateProfilePage() {
  return (
    <>
      {/* <div className="flex justify-between w-full">
        

        <div className="basis-[55%]">
          <Introduction2></Introduction2>
        </div>
      </div> */}

      <div className="w-[90%] px-20 m-auto">
        <CreateProfileForm></CreateProfileForm>
      </div>
      <Footer></Footer>
    </>
  );
}

export default CreateProfilePage;
