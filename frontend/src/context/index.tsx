import React, {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";

interface BlockifyContextInterface {
  userAddress: string | null;
  blogDid: string | null;
  selectedBlog: string | null;
  blockifyContract: any | null;
  blockifyTokenContract: any | null;
  setSelectedBlog: Dispatch<SetStateAction<string | null>>;
  setBlogDid: Dispatch<SetStateAction<string | null>>;
  setUserAddress: Dispatch<SetStateAction<string | null>>;
  setBlockifyContract: Dispatch<SetStateAction<any>>;
  setBlockifyTokenContract: Dispatch<SetStateAction<any>>;
}

export const BlockifyContext = createContext<BlockifyContextInterface>({
  userAddress: null,
  blogDid: null,
  selectedBlog: null,
  blockifyContract: null,
  blockifyTokenContract: null,
  setSelectedBlog: () => {},
  setBlogDid: () => {},
  setUserAddress: () => {},
  setBlockifyContract: () => {},
  setBlockifyTokenContract: () => {},
});

export const BlockifyProvider: React.FC<any> = ({ children }) => {
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [blogDid, setBlogDid] = useState<string | null>(null);
  const [blockifyContract, setBlockifyContract] = useState<string | null>(null);
  const [blockifyTokenContract, setBlockifyTokenContract] = useState<
    string | null
  >(null);

  return (
    <BlockifyContext.Provider
      value={{
        selectedBlog,
        blogDid,
        userAddress,
        blockifyContract,
        blockifyTokenContract,
        setSelectedBlog,
        setBlogDid,
        setUserAddress,
        setBlockifyContract,
        setBlockifyTokenContract,
      }}
    >
      {children}
    </BlockifyContext.Provider>
  );
};
