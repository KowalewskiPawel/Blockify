import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { usePublicRecord } from "@self.id/framework";
import { client, getBlog } from "../../queries";
import { Blog, BlogPost } from "../../types";
import { BlockifyContext } from "../../context";

export const BlogPage = () => {
  const [blog, setBlog] = useState<Blog>();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>();
  const [isLoading, setIsLoading] = useState(false);
  const { blogname } = useParams();
  const { blogDid } = useContext(BlockifyContext);
  const postsList = usePublicRecord(
    "basicProfile",
    blog?.blogData_blogDid || ""
  );

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const response = await client.query(getBlog, { blogname }).toPromise();
        setBlog(response.data.blogNFTMinteds[0]);
        setIsLoading(false);
      } catch (error) {
        console.error({ error });
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blogname]);

  useEffect(() => {
    const posts = postsList.isLoading
      ? "Loading..."
      : postsList.content
      ? postsList.content.blogname
      : "No profile to load";

    if (postsList.content?.blogname) {
      /* @ts-ignore */
      setBlogPosts(posts);
    }
  }, [postsList.content, postsList.isLoading]);

  return (
    <div className="pt-28">
      {isLoading ? (
        <div>Loading</div>
      ) : blog ? (
        <>
          {blogDid === blog.blogData_blogDid && (
            <Link to={`../add-post/${blog.blogData_blogname}`}>Add Post</Link>
          )}
          <div className="border-solid border-2 border-black p-4 m-auto w-1/3 rounded-md cursor-pointer">
            <p>
              {blog.blogData_coverPicture && (
                <img
                  src={blog.blogData_coverPicture}
                  alt={blog.blogData_blogname}
                />
              )}
              <br />
              Title:
              <span className="font-bold">{blog.blogData_blogname}</span>
            </p>
          </div>
          {blogPosts &&
            blogPosts.map((post: BlogPost, index: number) => (
              <div key={index}>
                <h4>{post.title}</h4>
                <MarkdownPreview source={post.content} />
                <p>Author: {post.name}</p>
                <p>Date: {post.date}</p>
              </div>
            ))}
        </>
      ) : (
        <p>No Blog found</p>
      )}
    </div>
  );
};
