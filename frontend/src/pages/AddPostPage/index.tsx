import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useViewerRecord, usePublicRecord } from "@self.id/framework";
import moment from "moment";
import { Web3Storage } from "web3.storage";
import { v4 as uuidv4 } from "uuid";
import { client, getBlog, getPostComments } from "../../queries";
import { Blog, BlogPost } from "../../types";
import { BlockifyContext } from "../../context";
import { PostEditor } from "../../components/PostEditor";

export const AddPostPage = () => {
  const [blog, setBlog] = useState<Blog>();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>();
  const [uploadFile, setUploadFile] = useState<File | undefined>();
  const [fileCid, setFileCid] = useState<string>();
  const [openedPosts, setOpenedPosts] = useState<number[]>([]);
  const [openedComments, setOpenedComments] = useState<number[]>([]);
  const [title, setTitle] = useState<string>("");
  const [blogPost, setBlogPost] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { blogname } = useParams();
  const { blogDid } = useContext(BlockifyContext);
  const record = useViewerRecord("basicProfile");
  const postsList = usePublicRecord(
    "basicProfile",
    blog?.blogData_blogDid || ""
  );
  /* @ts-ignore */
  const prevPosts: BlogPost[] = record.content?.blogname;

  const uploadToIpfs = async () => {
    if (!uploadFile) throw new Error("No file selected");
    try {
      const storage = new Web3Storage({
        /* @ts-ignore */
        token: process.env.REACT_APP_WEB3_STORAGE,
      });

      const uploadedFileCid = await storage.put([uploadFile], {
        maxRetries: 3,
        wrapWithDirectory: false,
      });

      const readyCID = `https://${uploadedFileCid}.ipfs.dweb.link/`;
      setFileCid(readyCID);
    } catch (error) {
      console.error({ error });
    }
  };

  const addPost = async () => {
    const post = {
      postId: uuidv4(),
      title: title,
      name: record.content?.name,
      content: blogPost,
      date: moment().format("DD/MM/YYYY"),
    };

    try {
      /* @ts-ignore */
      await record.merge({
        blogname: prevPosts ? [...prevPosts, post] : [post],
      });
    } catch (error) {
      console.error(error);
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
      ) : blog && blogDid === blog.blogData_blogDid ? (
        <>
          <div className="w-11/12 p-4 mx-auto mb-4 overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
            <p className="font-medium dark:text-white mb-4">Add new post</p>
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Title:
              </label>
              <input
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Enter post title here"
              />
            </div>
            <label
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              htmlFor="user_avatar"
            >
              Upload Files to IPFS
            </label>
            <input
              className="flex items-center justify-center w-full max-w-xs p-0 "
              name="upload-file"
              type="file"
              multiple={false}
              onChange={(event) =>
                setUploadFile(
                  event.target.files ? event.target.files[0] : undefined
                )
              }
            />
            <div className="my-4 mt-2 text-sm text-gray-500 dark:text-gray-300">
              {fileCid ? (
                <p>Uploaded file CID: {fileCid}</p>
              ) : (
                "Uploaded file CID will show here"
              )}
            </div>
            <button
              disabled={uploadFile === undefined}
              onClick={uploadToIpfs}
              className="inline-block px-6 my-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            >
              UPLOAD
            </button>
            <PostEditor value={blogPost} setValue={setBlogPost} />
            <button
              disabled={!record.isMutable || record.isMutating}
              onClick={addPost}
              className="inline-block px-6 my-4 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            >
              Add Post
            </button>
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
        <p>Not authorized to add post</p>
      )}
    </div>
  );
};
