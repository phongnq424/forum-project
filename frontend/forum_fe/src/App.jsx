import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import QueryProvider from "./providers/QueryProvider";
import PageRouters from "./RouterForPage/PageRouters";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-primary">
        <QueryProvider>
          <ToastContainer />
          <PageRouters />
        </QueryProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
