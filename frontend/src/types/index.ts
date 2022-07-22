export interface Post {
  postAdded_authorId: string;
  postAdded_username: string;
  postAdded_id: string;
  postAdded_content: string;
  postAdded_date: string;
  postAdded_picture: string;
  postAdded_title: string;
  postAdded_video: string;
  __typename: string;
  comments?: number;
}

export interface Comment {
  commentAdded_idOfPost: string;
  commentAdded_content: string;
  commentAdded_username: string;
  commentAdded_authorId: string;
  commentAdded_date: string;
}
