import { createClient } from "urql";

const APIURL = "";

export const client = createClient({
  url: APIURL,
});

export const getPostComments = `query commentAdded ($postId: String! ) {
  commentAddeds (where: { commentAdded_idOfPost: $postId }) {
    commentAdded_idOfPost
    commentAdded_content
    commentAdded_username
    commentAdded_authorId
    commentAdded_date
  }
}`;
