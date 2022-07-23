import { Routes, Route } from "react-router-dom";
import { Test } from "./pages/Test";
import { SignUpForm } from "./pages/CreateBlog";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/create-blog" element={<SignUpForm />} />
      </Routes>
    </>
  );
};

export default App;
