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
        className="border-solid border-2 border-black p-4 m-auto mb-4 w-1/3 rounded-md"
      >
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <div className="w-1/2 m-auto">
          <label htmlFor="blogname" className="ml-2">
            Blogname:
          </label>
          <input
            name="blogname"
            type="text"
            value={blogname}
            className="border-solid border-2 rounded-md m-2"
            onChange={(e) => setBlogname(e.target.value)}
          />
          <input
            className="flex items-center justify-center w-full max-w-xs p-0 "
            type="file"
            multiple={false}
            onChange={(event) =>
              setBlogPicture(
                event.target.files ? event.target.files[0] : undefined
              )
            }
          />
          <button className="bg-lime-400 p-1 border-solid border-black border-2 rounded-md">
            CREATE
          </button>
        </div>
      </form>
      {isLoading ? (
        <div>Loading</div>
      ) : blogs ? (
        blogs.map((element: Blog, index: number) => (
          <div
            key={index}
            className="border-solid border-2 border-black p-4 m-auto w-1/3 rounded-md cursor-pointer"
            onClick={() => {
              setSelectedBlog(element.blogData_blogname);
            }}
          >
            <p>
              {element.blogData_coverPicture && (
                <img
                  src={element.blogData_coverPicture}
                  alt={element.blogData_blogname}
                />
              )}
              <br />
              Title:
              <span className="font-bold">{element.blogData_blogname}</span>
            </p>
          </div>
        ))
      ) : (
        <div>You don't have any blogs</div>
      )}
    </div>
  );
};

export { SignUpForm };
