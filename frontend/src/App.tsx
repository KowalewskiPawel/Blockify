import { Routes, Route } from "react-router-dom";
import { Test } from "./pages/Test";
import { SignUpForm } from "./pages/CreateBlog";
import { BlogPage } from "./pages/BlogPage";
import { AddPostPage } from "./pages/AddPostPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/create-blog" element={<SignUpForm />} />
        <Route path="blog/:blogname" element={<BlogPage />} />
        <Route path="add-post/:blogname" element={<AddPostPage />} />
      </Routes>
    </>
  );
};

export default App;
