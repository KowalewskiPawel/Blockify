import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { client, getBlogs } from "../../queries";
import { Blog } from "../../types";

export const BlogsWall = () => {
  const [fetchedBlogs, setFetchedBlogs] = useState<Blog[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await client.query(getBlogs).toPromise();
        const blogsArray: Blog[] = [...response.data.blogNFTMinteds];
        setFetchedBlogs(blogsArray);
        setIsLoading(false);
      } catch (error) {
        console.error({ error });
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="w-full pt-28">
      {isLoading ? (
        <div>Loading</div>
      ) : fetchedBlogs ? (
        fetchedBlogs.map((element: Blog, index: number) => (
          <div
            key={index}
            className="border-solid border-black border-2 w-11/12 p-4 m-auto mb-4 rounded-md"
          >
            <Link to={`blog/${element.blogData_blogname}`}>
              <h4 className="font-bold">{element.blogData_blogname}</h4>
            </Link>
            <br />
            <img
              src={element.blogData_coverPicture}
              alt={element.blogData_blogname}
            />
          </div>
        ))
      ) : (
        <div>There are no Blogs to show</div>
      )}
    </div>
  );
};
