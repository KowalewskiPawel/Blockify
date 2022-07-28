import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { client, getBlogFollowers, getBlogs } from "../../queries";
import { Blog } from "../../types";

export const BlogsWall = () => {
  const [fetchedBlogs, setFetchedBlogs] = useState<Blog[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await client.query(getBlogs).toPromise();
        const blogsArray: Blog[] = [...response.data.blogNFTMinteds];
        blogsArray.forEach((blog: Blog, index: number) => {
          client
            .query(getBlogFollowers, {
              followedBlog: blog.blogData_blogId,
            })
            .toPromise()
            .then((data) => {
              /* @ts-ignore */
              const followerList = data.data.blogFolloweds.map(
                (follower: any) => follower.follower
              );
              blogsArray[index].followers = followerList;
            });
        });
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
    <div className="py-16">
      <div className="container m-auto px-6 text-gray-600 md:px-12 xl:px-6">
        <div className="mb-12 space-y-2 text-center">
          <h2 className="text-2xl text-cyan-900 font-bold md:text-4xl">
            Blockify
          </h2>
          <p className="lg:w-6/12 lg:mx-auto">
            {isLoading ? "Loading" : "Below you can find list of blogs:"}
          </p>
        </div>

        {!isLoading && fetchedBlogs ? (
          fetchedBlogs.map((element: Blog, index: number) => (
            <div key={index} className="grid gap-12 lg:grid-cols-2 m-4">
              <div className="p-1 rounded-xl group sm:flex space-x-6 bg-white bg-opacity-50 shadow-xl hover:rounded-2xl">
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
                      <Link to={`blog/${element.blogData_blogname}`}>
                        <h4 className="text-2xl font-semibold text-cyan-900">
                          {element.blogData_blogname}
                        </h4>
                      </Link>
                      <p className="text-gray-600">
                        Followers: {element.followers?.length}
                      </p>
                    </div>
                    <Link
                      to={`blog/${element.blogData_blogname}`}
                      className="block w-max text-cyan-600"
                    >
                      Read more
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h2 className="text-2xl text-cyan-900 font-bold md:text-4xl">
            There are no blogs to show
          </h2>
        )}
      </div>
    </div>
  );
};
