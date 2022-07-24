import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { usePublicRecord } from "@self.id/framework";
import { client, getBlog, getPostComments } from "../../queries";
import { Blog, BlogPost } from "../../types";
import { BlockifyContext } from "../../context";
import moment from "moment";

export const BlogPage = () => {
  const [blog, setBlog] = useState<Blog>();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>();
  const [commentInput, setCommentInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { blogname } = useParams();
  const { blogDid, blockifyContract, userAddress } =
    useContext(BlockifyContext);
  const postsList = usePublicRecord(
    "basicProfile",
    blog?.blogData_blogDid || ""
  );

  const submitComment = async (postId: string) => {
    try {
      const tx = await blockifyContract.addComment(commentInput, postId);
      await tx.wait();
    } catch (error) {
      console.error({ error });
    }
  };

  const followBlog = async () => {
    try {
      const tx = await blockifyContract.followBlog(
        Number(blog?.blogData_blogId)
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
              <br />
              {userAddress && blockifyContract && (
                <button onClick={followBlog}>Follow Blog</button>
              )}
            </p>
          </div>
          {blogPosts &&
            blogPosts.map((post: BlogPost, index: number) => (
              <div key={index}>
                <h4>{post.title}</h4>
                <MarkdownPreview source={post.content} />
                <p>Author: {post.name}</p>
                <p>Date: {post.date}</p>
                <p>Comments: {post.comments?.length}</p>
                {blockifyContract && userAddress && (
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
                    <button onClick={() => submitComment(post.postId)}>
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
        </>
      ) : (
        <p>No Blog found</p>
      )}
    </div>
  );
};
