import { useState, useEffect, useContext } from "react";
import { Web3Storage } from "web3.storage";
import {
  client,
  getUserBlogs,
  getBlogFollowers,
  checkBlogname,
} from "../../queries";
import { contractAddress } from "../../consts";
import { BlockifyContext } from "../../context";
import { Blog } from "../../types";
import { Link } from "react-router-dom";

const SignUpForm = () => {
  const [blogs, setBlogs] = useState<Blog[]>();
  const [blogname, setBlogname] = useState<string>("");
  const [blogPicture, setBlogPicture] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    blogDid,
    userAddress,
    blockifyContract,
    blockifyTokenContract,
    setSelectedBlog,
  } = useContext(BlockifyContext);

  const submitHandler = (e: any) => {
    e.preventDefault();
    profileCreate();
  };

  const profileCreate = async () => {
    setErrorMessage("");
    if (!blogPicture) throw new Error("No picture selected");
    try {
      const storage = new Web3Storage({
        /* @ts-ignore */
        token: process.env.REACT_APP_WEB3_STORAGE,
      });

      const coverImageCid = await storage.put([blogPicture], {
        maxRetries: 3,
        wrapWithDirectory: false,
      });

      const imageCID = `https://${coverImageCid}.ipfs.dweb.link/`;
      const response = await client
        .query(checkBlogname, { blogname })
        .toPromise();
      setIsLoading(false);
      if (response.data.blogNFTMinteds.length) {
        setErrorMessage("Blogname already exists!");
        return;
      }

      const approveTx = await blockifyTokenContract.approve(
        contractAddress,
        10000
      );
      await approveTx.wait();

      const tx = await blockifyContract.mintBlogNFT(
        blogname,
        blogDid,
        imageCID
      );
      await tx.wait();
    } catch (error) {
      console.error({ error });
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await client
          .query(getUserBlogs, { address: userAddress })
          .toPromise();
        const addressBlogs = response.data.blogNFTMinteds;

        addressBlogs.forEach((blog: Blog, index: number) => {
          client
            .query(getBlogFollowers, {
              blogId: blog.blogId,
            })
            .toPromise()
            .then(
              (data) =>
                (addressBlogs[index].followers = [
                  data.data.blogFolloweds.map(
                    (follower: any) => follower.follower
                  ),
                ])
            );
        });

        setBlogs(addressBlogs);
        setIsLoading(false);
      } catch (error) {
        console.error({ error });
        setIsLoading(false);
      }
    };
    if (userAddress) {
      (async () => {
        await fetchBlogs();
      })();
    }
  }, [userAddress]);

  if (!userAddress) {
    return <p>Please Connect Wallet to login</p>;
  }

  return (
    <div className="pt-28">
      <form
        onSubmit={submitHandler}
        className="w-11/12 p-4 mx-auto mb-4 overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800"
      >
        <p className="font-medium dark:text-white mb-4">Create Blog</p>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <div className="mb-6">
          <label
            htmlFor="blogname"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Blogname:
          </label>
          <input
            name="blogname"
            type="text"
            value={blogname}
            onChange={(e) => setBlogname(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Enter your blogname here"
            required
          />
        </div>
        <label
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          htmlFor="user_avatar"
        >
          Upload Cover Image
        </label>
        <input
          multiple={false}
          onChange={(event) =>
            setBlogPicture(
              event.target.files ? event.target.files[0] : undefined
            )
          }
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          type="file"
        />
        <div
          className="my-4 mt-2 text-sm text-gray-500 dark:text-gray-300"
          id="user_avatar_help"
        >
          A cover image will display as the logo of your blog
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Create Blog
        </button>
      </form>
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
      ) : blogs ? (
        <div className="w-11/12 mx-auto mb-4 grid gap-12 lg:grid-cols-2">
          {" "}
          {blogs.map((element: Blog, index: number) => (
            <div
              key={index}
              className="p-1 rounded-xl group sm:flex space-x-6 bg-white dark:bg-gray-800 bg-opacity-50 shadow-xl hover:rounded-2xl cursor-pointer"
              onClick={() => {
                setSelectedBlog(element.blogData_blogname);
              }}
            >
              <img
                src={element.blogData_coverPicture}
                alt={element.blogData_blogname}
                loading="lazy"
                width="1000"
                height="667"
                className="h-56 sm:h-full w-full sm:w-5/12 object-cover object-top rounded-lg transition duration-500 group-hover:rounded-xl"
              />
              <div className="sm:w-7/12 pl-0 p-5">
                <div className="space-y-2">
                  <div className="space-y-4">
                    <Link to={`../blog/${element.blogData_blogname}`}>
                      <h4 className="text-2xl font-semibold text-white">
                        {element.blogData_blogname}
                      </h4>
                    </Link>
                    <p className="text-gray-300">Click on the card to select</p>
                  </div>
                  <Link
                    to={`../blog/${element.blogData_blogname}`}
                    className="block w-max text-cyan-600"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>You don't have any blogs</div>
      )}
    </div>
  );
};

export { SignUpForm };
