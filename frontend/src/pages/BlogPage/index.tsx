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
        <div>Loading</div>
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
                  <MarkdownPreview source={post.content} />
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
