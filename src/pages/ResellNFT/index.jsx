import axios from 'axios'
import { ethers } from 'ethers'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Web3Modal from 'web3modal'
import { Button, Card, InputNumber } from 'antd'

import { marketplaceAddress } from '../../../config'

import NFTMarketplace from '../../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { paths } from '../../constants'
import { Loading } from '../../components'
import { DEV, INFURA_PROJECT_ID } from '../../env'

const ResellNFT = () => {
  const [loading, setLoading] = useState(true)
  const [formInput, updateFormInput] = useState({
    name: '',
    price: '',
    image: '',
  })
  // const router = useRouter()
  let navigate = useNavigate()
  let [searchParams] = useSearchParams()
  // const { id, tokenURI } = router.query
  let id = searchParams.get('id')
  let tokenURI = searchParams.get('tokenURI')

  const {
    name: nftName,
    image: nftImage,
    description: nftDescription,
    price,
  } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  const fetchNFT = useCallback(async () => {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput((state) => ({
      ...state,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
    }))
    setLoading(false)
  }, [tokenURI])

  async function listNFTForSale() {
    if (!price) return
    if (DEV === 'develop') {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      provider = new ethers.providers.Web3Provider(connection)
    } else {
      var url = `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`
      provider = new ethers.providers.JsonRpcProvider(url)
    }
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    )
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, {
      value: listingPrice,
    })
    await transaction.wait()

    // router.push('/')
    navigate(`../${paths.nftMarketplace}`)
  }

  if (loading) return <Loading />

  return (
    <Card
      title="Sell NFT"
      style={{ width: 300 }}
      cover={<img alt="example" src={nftImage} />}
    >
      <Card.Meta title={nftName} description={nftDescription} />
      <InputNumber
        style={{
          width: 200,
          // flex: 1
        }}
        defaultValue="0.01"
        min="0"
        max="0.1"
        step="0.01"
        onChange={(value) => updateFormInput({ ...formInput, price: value })}
        stringMode
      />
      <Button
        type="primary"
        style={{
          backgroundColor: '#0095f6',
          borderColor: '#0095f6',
          borderRadius: 4,
          marginTop: 16,
        }}
        onClick={listNFTForSale}
      >
        Resell
      </Button>
    </Card>
  )

  // return (
  //   <div className="flex justify-center">
  //     <div className="w-1/2 flex flex-col pb-12">
  //       <input
  //         placeholder="Asset Price in Eth"
  //         className="mt-2 border rounded p-4"
  //         onChange={(e) =>
  //           updateFormInput({ ...formInput, price: e.target.value })
  //         }
  //       />
  //       {image && <img className="rounded mt-4" width="350" src={image} />}
  //       <button
  //         onClick={listNFTForSale}
  //         className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
  //       >
  //         List NFT
  //       </button>
  //     </div>
  //   </div>
  // )
}

export default ResellNFT
