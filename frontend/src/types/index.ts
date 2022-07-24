export interface Blog {
  blogData_blogDid: string;
  blogData_blogname: string;
  blogData_coverPicture: string;
  blogData_followers: string;
  blogId: string;
  __typename: string;
}

export interface Comment {
  commentAdded_idOfPost: string;
  commentAdded_content: string;
  commentAdded_authorId: string;
  commentAdded_date: string;
}
export interface BlogPost {
  title: string;
  name: string;
  content: string;
  date: string;
}