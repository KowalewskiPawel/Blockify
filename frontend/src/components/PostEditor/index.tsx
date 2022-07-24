import { Dispatch, SetStateAction } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

interface PostEditorProps {
  value: string | undefined;
  setValue: Dispatch<SetStateAction<string | undefined>>;
}

export const PostEditor = ({ value, setValue }: PostEditorProps) => {
  return (
    <div className="container">
      <MDEditor
        value={value}
        onChange={setValue}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
      />
    </div>
  );
};
