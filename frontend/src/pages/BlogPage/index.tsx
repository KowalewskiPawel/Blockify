import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import { client, getBlog } from "../../queries";
import { Blog } from "../../types";
import { BlockifyContext } from "../../context";

export const BlogPage = () => {
  const [blog, setBlog] = useState<Blog>();
  const [blogPost, setBlogPost] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { blogname } = useParams();
  const { blogDid } = useContext(BlockifyContext);

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
        </>
      ) : (
        <p>No Blog found</p>
      )}
    </div>
  );
};
