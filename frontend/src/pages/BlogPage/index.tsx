import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { usePublicRecord } from "@self.id/framework";
import { contractAddress } from "../../consts";
import {
  client,
  getBlog,
  getPostComments,
  getBlogFollowers,
} from "../../queries";
import { Blog, BlogPost } from "../../types";
import { BlockifyContext } from "../../context";
import moment from "moment";

export const BlogPage = () => {
  const [blog, setBlog] = useState<Blog>();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>();
  const [commentInput, setCommentInput] = useState<string>("");
  const [openedPosts, setOpenedPosts] = useState<number[]>([]);
  const [openedComments, setOpenedComments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { blogname } = useParams();
  const { blockifyContract, blockifyTokenContract, userAddress } =
    useContext(BlockifyContext);
  const postsList = usePublicRecord(
    "basicProfile",
    blog?.blogData_blogDid || ""
  );

  const submitComment = async (postId: string) => {
    try {
      const approveTx = await blockifyTokenContract.approve(
        contractAddress,
        10000
      );
      await approveTx.wait();

      const tx = await blockifyContract.addComment(
        commentInput,
        postId,
        blog?.blogData_blogOwner,
        blog?.blogData_blogId
      );
      await tx.wait();
    } catch (error) {
      console.error({ error });
    }
  };

  const followBlog = async () => {
    try {
      const approveTx = await blockifyTokenContract.approve(
        contractAddress,
        10000
      );
      await approveTx.wait();

      const tx = await blockifyContract.followBlog(
        Number(blog?.blogData_blogId),
        blog?.blogData_blogOwner
      );
      await tx.wait();
    } catch (error) {
      console.error({ error });
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      try {
        const response = await client.query(getBlog, { blogname }).toPromise();
        const fetchedBlog: Blog = response.data.blogNFTMinteds[0];

        client
          .query(getBlogFollowers, {
            followedBlog: fetchedBlog.blogData_blogId,
          })
          .toPromise()
          .then((data) => {
            /* @ts-ignore */
            const followerList = data.data.blogFolloweds.map(
              (follower: any) => follower.follower
            );
            fetchedBlog.followers = followerList;
          });
        setBlog(fetchedBlog);
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
      posts.forEach((post: BlogPost, index: number) => {
        client
          .query(getPostComments, { postId: post.postId })
          .toPromise()
          .then(
            (data) =>
              /* @ts-ignore */
              (posts[index].comments = [...data.data.commentAddeds])
          );
      });
      /* @ts-ignore */
      setBlogPosts(posts);
    }
  }, [postsList.content, postsList.isLoading]);

  return (
    <div className="pt-28">
      {isLoading ? (
        <div role="status">
          <svg
            aria-hidden="true"
            className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      ) : blog ? (
        <>
          <div className="w-11/12 mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
            <img
              className="object-cover w-full h-64"
              src={blog.blogData_coverPicture}
              alt={blog.blogData_blogname}
            />
            <div className="p-6">
              <div>
                <h2 className="block mt-2 text-2xl font-semibold text-gray-800 transition-colors duration-200 transform dark:text-white hover:text-gray-600 hover:underline">
                  {blog.blogData_blogname}
                </h2>
                {userAddress && blockifyContract && (
                  <button
                    onClick={followBlog}
                    disabled={blog.followers?.includes(userAddress)}
                    className="inline-block px-6 my-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    {blog.followers?.includes(userAddress)
                      ? "Followed"
                      : "Follow Blog"}
                  </button>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="mx-2 font-semibold text-gray-700 dark:text-gray-200">
                      Followers:
                    </span>
                  </div>
                  <span className="mx-1 text-xs text-gray-600 dark:text-gray-300">
                    {blog.followers?.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {blogPosts &&
            blogPosts.map((post: BlogPost, index: number) => (
              <div
                key={index}
                className="w-11/12 m-4 px-8 py-4 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-gray-600 dark:text-gray-400">
                    {post.date}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-700 dark:text-white hover:text-gray-600 dark:hover:text-gray-200 hover:underline">
                    {post.title}
                  </span>
                </div>
                {openedPosts.includes(index) && (
                  <MarkdownPreview source={post.content} className="p-4" />
                )}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() =>
                      !openedPosts.includes(index)
                        ? setOpenedPosts((prevPosts) => [...prevPosts, index])
                        : setOpenedPosts((prevPosts) =>
                            prevPosts.filter((post) => post !== index)
                          )
                    }
                    className="px-3 py-1 text-sm font-bold text-gray-100 transition-colors duration-200 transform bg-gray-600 rounded cursor-pointer hover:bg-gray-500"
                  >
                    {openedPosts.includes(index) ? "Hide" : "Read more"}
                  </button>
                  <div className="flex items-center">
                    <span
                      onClick={() =>
                        !openedComments.includes(index)
                          ? setOpenedComments((prevComments) => [
                              ...prevComments,
                              index,
                            ])
                          : setOpenedComments((prevComments) =>
                              prevComments.filter(
                                (comment) => comment !== index
                              )
                            )
                      }
                      className="font-bold text-gray-700 cursor-pointer dark:text-gray-200"
                    >
                      Comments: {post.comments?.length}
                    </span>
                  </div>
                </div>
                {blockifyContract &&
                  openedComments.includes(index) &&
                  userAddress &&
                  blog.followers?.includes(userAddress) && (
                    <div className="my-6">
                      <div className="my-6">
                        <label
                          htmlFor="comment"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Comment:
                        </label>
                        <input
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Enter your comment here"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => submitComment(post.postId)}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                {post.comments && openedComments.includes(index) && (
                  <div>
                    {post.comments.map((comment: any, index: number) => (
                      <div
                        key={index}
                        className="mt-2 p-4 text-gray-600 dark:text-gray-300 overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-700"
                      >
                        <p>{comment.commentAdded_content}</p>
                        <p>Author: {comment.commentAdded_authorId} </p>
                        <p>
                          Date:{" "}
                          <span>
                            {moment
                              .unix(Number(comment.commentAdded_date))
                              .format("DD/MM/YYYY")}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </>
      ) : (
        <p>No Blog found</p>
      )}
    </div>
  );
};
