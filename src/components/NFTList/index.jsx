import { useMintNFT, useNFTCollection, useNFTs } from "@thirdweb-dev/react";

export const NFTList = () => {
  const address = useAddress();
  const nftCollection = useNFTCollection("<NFT-COLLECTION-CONTRACT-ADDRESS>");
  const { data: nfts } = useNFTs(nftCollection);
  const { mutate: mintNFT } = useMintNFT(nftCollection);

  const mint = () => {
    mintNFT({
      to: address,
      metadata: {
        name: "Cool NFT",
        description: "Minted from react",
      },
    });
  };

  return (
    <div>
      <button onClick={mint}>Mint</button>
      <ul>
        {nfts?.map((nft) => (
          <li key={nft.metadata.id.toString()}>{nft.metadata.name}</li>
        ))}
      </ul>
    </div>
  );
};