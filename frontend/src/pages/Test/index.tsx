import { Link } from "react-router-dom";
import { ConnectButton } from "../../components/ConnectButton";

const Test = () => {
  return (
    <div>
      TEST
      <ConnectButton />
      <Link to="/create-blog">Create Blog</Link>
    </div>
  );
};

export { Test };
