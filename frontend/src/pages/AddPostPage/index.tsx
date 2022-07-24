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
        <div>Loading</div>
      ) : blog && blogDid === blog.blogData_blogDid ? (
        <>
          <label htmlFor="title" className="ml-2">
            Title:
          </label>
          <input
            name="title"
            type="text"
            value={title}
            className="border-solid border-2 rounded-md m-2"
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <div>
            <label htmlFor="upload-file" className="ml-2">
              Upload File to IPFS
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
            <button disabled={uploadFile === undefined} onClick={uploadToIpfs}>
              UPLOAD
            </button>
            {fileCid && <p>Uploaded file CID: {fileCid}</p>}
          </div>
          <PostEditor value={blogPost} setValue={setBlogPost} />
          <button
            disabled={!record.isMutable || record.isMutating}
            onClick={addPost}
          >
            Send Post
          </button>
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
        <p>Not authorized to add post</p>
      )}
    </div>
  );
};
