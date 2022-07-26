import {
  ThirdwebNftMedia,
  useAddress,
  useClaimNFT,
  useDisconnect,
  useEditionDrop,
  useMetamask,
  useMintNFT,
  useNFTDrop,
  useNFTs,
  useUnclaimedNFTs,
} from '@thirdweb-dev/react'
import { useEffect, useState } from 'react'
import { THIRDWEB_CONTRACT_ADDRESS } from '../../env'

const MintButton = () => {
  const nftDrop = useNFTDrop(THIRDWEB_CONTRACT_ADDRESS)
  const { mutate: mintNft, isLoading, error } = useMintNFT(nftDrop)

  if (error) {
    console.error('failed to mint nft', error)
  }

  return (
    <button
      disabled={isLoading}
      onClick={() => mintNft({ name: 'My awesome NFT!' })}
    >
      Mint!
    </button>
  )
}

const ClaimButton = ({ quantity = 1 }) => {
  const contract = useNFTDrop(THIRDWEB_CONTRACT_ADDRESS)
  const connectedWalletAddress = useAddress()

  // Get the function to claim NFTs
  const { mutate: claim, isLoading, error } = useClaimNFT(contract)

  if (error) {
    console.error('failed to claim nft', error)
  }

  // And add a button to claim NFTs
  return (
    <button
      disabled={isLoading}
      onClick={() => claim({ to: connectedWalletAddress, quantity })}
    >
      Claim NFT
    </button>
  )
}

const UnclaimButton = ({ quantity = 1 }) => {
  const contract = useNFTDrop(THIRDWEB_CONTRACT_ADDRESS)
  const connectedWalletAddress = useAddress()

  // Get the function to claim NFTs
  const { mutate: unclaim, isLoading, error } = useUnclaimedNFTs(contract)

  if (error) {
    console.error('failed to claim nft', error)
  }

  // And add a button to claim NFTs
  return (
    <button
      disabled={isLoading}
      onClick={() => unclaim({ to: connectedWalletAddress, quantity: 1 })}
    >
      Unclaim NFT
    </button>
  )
}

const NFTList = () => {
  const contract = useNFTDrop(THIRDWEB_CONTRACT_ADDRESS)
  const address = useAddress()
  const editionDrop = useEditionDrop(
    THIRDWEB_CONTRACT_ADDRESS
  );

  // Get all NFTs from this contract
  const { data: nfts, isLoading } = useNFTs(contract)
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  useEffect(() => {
    if (!address) {
      return;
    }
    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🎉 You have an NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("🤷‍♂️ You don't have an NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get nft balance", error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  // Display them in a gallery
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div
          style={{
            overflow: 'hidden scroll',
            height: 400,
            border: '1px solid black',
          }}
        >
          <MintButton />
          <ClaimButton quantity={nfts.length} />
          <UnclaimButton />

          {nfts.map((nft, id) => {
            const isOwner = nft.owner === address
            return (
              <div key={`nft-${id}`}>
                <ThirdwebNftMedia
                  key={id}
                  metadata={nft.metadata}
                  style={{
                    width: 200,
                    height: 200,
                  }}
                />
                <h3>{nft.metadata.name}</h3>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const Thirdweb = () => {
  const connectWithMetamask = useMetamask()
  const address = useAddress()
  const disconnectWallet = useDisconnect()

  return (
    <div>
      {address ? (
        <>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
          <p>Your address: {address}</p>
          <NFTList />
        </>
      ) : (
        <button onClick={connectWithMetamask}>Connect Metamask Wallet</button>
      )}
    </div>
  )
}

export default Thirdweb
