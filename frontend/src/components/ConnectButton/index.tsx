import { useContext, useEffect, useState } from "react";
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";
import { BlockifyContext } from "../../context";
import { contractAddress, tokenAddress } from "../../consts";
import BlockifyContract from "../../abi/Blockify.json";
import BlockifyTokenContract from "../../abi/BlockifyToken.json";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export const ConnectButton = () => {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connection, connect, disconnect] = useViewerConnection();
  const {
    setUserAddress,
    setBlockifyContract,
    setBlockifyTokenContract,
    setBlogDid,
  } = useContext(BlockifyContext);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      /* @ts-ignore */
      setUserAddress(accounts[0]);
      await connect(
        /* @ts-ignore */
        new EthereumAuthProvider(window.ethereum, accounts[0])
      ).then((data) => data?.id && setBlogDid(data?.id));
      /* @ts-ignore */
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        BlockifyContract.abi,
        signer
      );
      setBlockifyContract(contract);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        BlockifyTokenContract.abi,
        signer
      );
      setBlockifyTokenContract(tokenContract);
      setIsConnecting(false);
    } catch (error) {
      setIsConnecting(false);
      console.error(error);
    }
  };

  if (isConnecting) {
    return <span>Connecting...</span>;
  }

  return connection?.status === "connected" ? (
    <button onClick={disconnect}>
      Disconnect {connection?.selfID.id.substring(0, 8)}...
      {connection?.selfID.id.substring(60)}
    </button>
  ) : "ethereum" in window ? (
    <button
      disabled={connection?.status === "connecting"}
      onClick={connectWallet}
    >
      Connect
    </button>
  ) : (
    <p>
      An injected Ethereum provider such as{" "}
      <a href="https://metamask.io/">MetaMask</a> is needed to authenticate.
    </p>
  );
};
