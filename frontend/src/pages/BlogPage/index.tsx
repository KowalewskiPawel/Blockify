import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
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
  const [isLoading, setIsLoading] = useState(false);
  const { blogname } = useParams();
  const { blogDid, blockifyContract, blockifyTokenContract, userAddress } =
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
          <div className="border-solid border-2 border-black p-4 m-auto mx-10 w-11/12 rounded-md">
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
              <br />
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
            </p>
            {blogPosts &&
              blogPosts.map((post: BlogPost, index: number) => (
                <div
                  key={index}
                  className="border-solid border-2 border-black p-4 m-auto mt-4 mb-4 w-11/12 rounded-md"
                >
                  <h4>{post.title}</h4>
                  <MarkdownPreview source={post.content} />
                  <p>Author: {post.name}</p>
                  <p>Date: {post.date}</p>
                  <p>Comments: {post.comments?.length}</p>
                  {blockifyContract &&
                    userAddress &&
                    blog.followers?.includes(userAddress) && (
                      <div style={{ margin: "10px" }}>
                        <label>
                          Comment:
                          <input
                            name="comment"
                            type="text"
                            placeholder="Enter your comment"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                          />
                        </label>
                        <button
                          onClick={() => submitComment(post.postId)}
                          className="inline-block px-6 my-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  {post.comments && (
                    <div>
                      {post.comments.map((comment: any, index: number) => (
                        <div key={index} style={{ fontSize: "12px" }}>
                          <p>{comment.commentAdded_content}</p>
                          <p style={{ fontWeight: "bold" }}>
                            Author: {comment.commentAdded_authorId}{" "}
                          </p>
                          <p>
                            Date:
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
          </div>
        </>
      ) : (
        <p>No Blog found</p>
      )}
    </div>
  );
};
