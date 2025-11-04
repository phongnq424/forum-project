import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Introduction2 from "../components/Introduction2";
import CreateProfileForm from "../components/CreateProfileForm";

function CreateProfilePage() {
  return (
    <>
      <div className="flex justify-between">
        <div className="basis-[50%] px-20">
          <CreateProfileForm></CreateProfileForm>
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

export default CreateProfilePage;
