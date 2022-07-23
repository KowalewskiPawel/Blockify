import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { client, getBlogs } from "../../queries";
import { Blog } from "../../types";
import { ConnectButton } from "../../components/ConnectButton";

const Test = () => {
  const [fetchedBlogs, setFetchedBlogs] = useState<Blog[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await client.query(getBlogs).toPromise();
        const blogsArray: Blog[] = [...response.data.blogNFTMinteds];
        // blogsArray.forEach((blog, index) => {
        //   client
        //     .query(getPostComments, { postId: post.postAdded_id })
        //     .toPromise()
        //     .then(
        //       (data) =>
        //         (postsArray[index].comments = data.data.commentAddeds?.length)
        //     );
        // });
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
    <div>
      TEST
      <ConnectButton />
      <Link to="/create-blog">Create Blog</Link>
      {isLoading ? (
        <div>Loading</div>
      ) : fetchedBlogs ? (
        fetchedBlogs.map((element: Blog, index: number) => (
          <div
            key={index}
            className="border-solid border-black border-2 w-1/3 p-4 m-auto mb-4 rounded-md"
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

export { Test };
