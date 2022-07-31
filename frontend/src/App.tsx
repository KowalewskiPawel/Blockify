import { Routes, Route, Navigate } from "react-router-dom";
import { BlogsWall } from "./pages/BlogsWall";
import { SignUpForm } from "./pages/CreateBlog";
import { BlogPage } from "./pages/BlogPage";
import { AddPostPage } from "./pages/AddPostPage";
import { Navbar } from "./components/Navbar";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<BlogsWall />} />
        <Route path="/create-blog" element={<SignUpForm />} />
        <Route path="blog/:blogname" element={<BlogPage />} />
        <Route path="add-post/:blogname" element={<AddPostPage />} />
      </Routes>
    </>
  );
};

export default App;
