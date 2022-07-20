import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";

export default function Test() {
  const [value, setValue] = useState<string | undefined>(
    `**Hello world!!!** <IFRAME SRC=\"javascript:javascript:alert(window.origin);\"></IFRAME>`
  );
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
}
