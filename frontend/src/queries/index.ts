import { createClient } from "urql";

const APIURL =
  "https://api.thegraph.com/subgraphs/name/kowalewskipawel/blockify";

export const client = createClient({
  url: APIURL,
});

export const getBlogs = `query BlogNFTMinted {
  blogNFTMinteds {
      blogId
      blogData_blogDid
      blogData_blogname
      blogData_coverPicture
  }
}`;

export const getBlog = `query BlogNFTMinted($blogname: String! ) {
  blogNFTMinteds (where: { blogData_blogname: $blogname }) {
    blogId
    blogData_blogDid
    blogData_blogname
    blogData_coverPicture
  }
}`;

export const getUserBlogs = `query BlogNFTMinted($address: String! ) {
  blogNFTMinteds (where: { sender: $address }) {
    blogId
    blogData_blogDid
    blogData_blogname
    blogData_coverPicture
  }
}`;

export const checkBlogname = `query BlogNFTMinted($blogname: String! ) {
  blogNFTMinteds (where: { blogData_blogname: $blogname }) {
    blogId
    blogData_blogname
  }
}`;

export const getPostComments = `query commentAdded ($postId: String! ) {
  commentAddeds (where: { commentAdded_idOfPost: $postId }) {
    commentAdded_idOfPost
    commentAdded_content
    commentAdded_authorId
    commentAdded_date
  }
}`;

export const getBlogFollowers = `query BlogFollowed ($blogId: String! ){
  blogFolloweds (where: { id: $blogId }) {
    follower
  }
}`;
