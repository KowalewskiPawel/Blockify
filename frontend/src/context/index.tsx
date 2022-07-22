import React, {
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";

interface BlockifyContextInterface {
  userAddress: string | null;
  selectedBlog: string | null;
  blockifyContract: any | null;
  setSelectedBlog: Dispatch<SetStateAction<string | null>>;
  setUserAddress: Dispatch<SetStateAction<string | null>>;
  setBlockifyContract: Dispatch<SetStateAction<any>>;
}

export const BlockifyContext = createContext<BlockifyContextInterface>({
  userAddress: null,
  selectedBlog: null,
  blockifyContract: null,
  setSelectedBlog: () => {},
  setUserAddress: () => {},
  setBlockifyContract: () => {},
});

export const BlockifyProvider: React.FC<any> = ({ children }) => {
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [blockifyContract, setBlockifyContract] = useState<string | null>(null);

  return (
    <BlockifyContext.Provider
      value={{
        selectedBlog,
        userAddress,
        blockifyContract,
        setSelectedBlog,
        setUserAddress,
        setBlockifyContract,
      }}
    >
      {children}
    </BlockifyContext.Provider>
  );
};
