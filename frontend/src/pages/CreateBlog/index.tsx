import React, { useState, useEffect, useRef, useContext } from "react";
import { BlockifyContext } from "../../context";

const SignUpForm = () => {
  const [blogs, setBlogs] = useState<string[]>();
  const [blogname, setBlogname] = useState<string>("");
  const [blogPicture, setBlogPicture] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { userAddress, blockifyContract, setSelectedBlog } =
    useContext(BlockifyContext);

  const submitHandler = (e: any) => {
    e.preventDefault();
    profileCreate();
  };

  const profileCreate = async () => {
    setErrorMessage("");
    try {
      //   const response = await client
      //     .query(checkBlogname, { blogname: inputNameValue })
      //     .toPromise();
      //   setIsLoading(false);
      //   if (response.data.profileNFTMinteds.length) {
      //     setErrorMessage("Username already exists!");
      //     return;
      //   }

      const tx = await blockifyContract.mintBlogNFT(blogname, blogPicture);
      await tx.wait();
    } catch (error) {
      console.error({ error });
    }
  };

  //   useEffect(() => {
  //     const fetchBlogs = async () => {
  //       setIsLoading(true);
  //       try {
  //         const response = await client
  //           .query(getUserBlogs, { address: userAddress })
  //           .toPromise();
  //         const addressBlogs = response.data.blogNFTMinteds;

  //         addressBlogs.forEach((blog: Blog, index: number) => {
  //           client
  //             .query(getFollowed, {
  //               authorId: blog.blogId,
  //             })
  //             .toPromise();
  //         });

  //         setBlogs(addressBlogs);
  //         setIsLoading(false);
  //       } catch (error) {
  //         console.error({ error });
  //         setIsLoading(false);
  //       }
  //     };
  //     if (userAddress) {
  //       (async () => {
  //         await fetchBlogs();
  //       })();
  //     }
  //   }, [userAddress]);

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
          <label htmlFor="username" className="ml-2">
            Username:
          </label>
          <input
            name="username"
            type="text"
            value={blogname}
            className="border-solid border-2 rounded-md m-2"
            onChange={(e) => setBlogname(e.target.value)}
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
              setSelectedBlog(element.blogId);
            }}
          >
            <p>
              {element.blogData_blogPicture && (
                <img
                  src={element.blogData_profilePicture}
                  alt={element.blogData_username}
                />
              )}
              <br />
              Username:
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
