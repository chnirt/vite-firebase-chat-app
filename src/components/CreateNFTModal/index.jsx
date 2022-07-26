import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Row,
  Typography,
  Upload,
} from 'antd'
import {
  forwardRef,
  Fragment,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import { UserOutlined } from '@ant-design/icons'
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'
import Web3Modal from 'web3modal'
import { t } from 'i18next'

import { avatarPlaceholder, eventNames } from '../../constants'
import { useAuth } from '../../context'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { DEV, INFURA_PROJECT_ID, PRIVATE_KEY } from '../../env'

import {
  marketplaceAddress
} from '../../../config'

import NFTMarketplace from '../../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

const ipfs = create('https://ipfs.infura.io:5001/api/v0')

export const CreateNftModal = forwardRef((props, ref) => {
  const auth = useAuth()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = useCallback(() => {
    setIsModalVisible(true)
  }, [])

  const getFileURL = useCallback(async (file) => {
    try {
      const added = await ipfs.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      })
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }, [])

  const uploadToIPFS = async (ipfsInput) => {
    const data = JSON.stringify(ipfsInput)
    try {
      const added = await ipfs.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const { name, description, price, files } = values
      // console.log(values)

      const file = files[0].originFileObj
      const fileUrl = await getFileURL(file)
      const ipfsData = {
        name,
        description,
        image: fileUrl,
      }
      const url = await uploadToIPFS(ipfsData)

      let provider
      let signer
      if (DEV === 'develop') {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        provider = new ethers.providers.Web3Provider(connection)
        signer = provider.getSigner()
      } else {
        var infuraUrl = `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`
        provider = new ethers.providers.JsonRpcProvider(infuraUrl)
        signer = new ethers.Wallet(PRIVATE_KEY);
      }

      /* create the NFT */
      const nftPrice = ethers.utils.parseUnits(price, 'ether')
      let contract = new ethers.Contract(
        marketplaceAddress,
        NFTMarketplace.abi,
        signer
      )
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()
      let transaction = await contract.createToken(url, nftPrice, {
        value: listingPrice,
      })
      await transaction.wait()

      logAnalyticsEvent(eventNames.createNFT, {
        url
      })

      handleCancel()
    } catch (error) {
      console.log('Validate Failed:', error)
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsModalVisible(false)
  }, [])

  const normFile = useCallback((e) => {
    // console.log('Upload event:', e)
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }, [])

  const handleAfterClose = useCallback(() => {
    form.resetFields()
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      show: showModal,
    }),
    []
  )

  const tText = {
    cnnft: t('src.components.CreateNftModal.cnnft'),
    create: t('src.components.CreateNftModal.create'),
    name: t('src.components.CreateNftModal.name'),
    description: t('src.components.CreateNftModal.description'),
    price: t('src.components.CreateNftModal.price'),
    sfc: t('src.components.CreateNftModal.sfc'),
  }

  return (
    <Fragment>
      <Modal
        title={tText.cnnft}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            style={{
              color: '#0095f6',
            }}
            type="link"
            onClick={handleOk}
          >
            {tText.create}
          </Button>,
        ]}
        centered
        afterClose={handleAfterClose}
      >
        <Row
          style={{
            marginBottom: 14,
          }}
          align="middle"
        >
          <Avatar
            shape="circle"
            size={{
              xs: 38,
              sm: 38,
              md: 38,
              lg: 38,
              xl: 38,
              xxl: 38,
            }}
            icon={<UserOutlined color="#eeeeee" />}
            src={auth?.user?.avatar ?? avatarPlaceholder}
          />
          {auth?.user?.username && (
            <Typography.Title
              style={{ marginLeft: '14px', marginBottom: 0 }}
              level={5}
            >
              {auth?.user?.username}
            </Typography.Title>
          )}
        </Row>

        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{}}
        >
          <Form.Item
            name="name"
            // label="name"
            rules={[
              {
                required: true,
                message: 'Please input the name of NFT!',
              },
            ]}
          >
            <Input placeholder={tText.name} />
          </Form.Item>
          <Form.Item
            name="description"
            // label="description"
            rules={[
              {
                required: true,
                message: 'Please input the description of NFT!',
              },
            ]}
          >
            <Input placeholder={tText.description} />
          </Form.Item>
          <Form.Item
            name="price"
            // label="price"
            rules={[
              {
                required: true,
                message: 'Please input the price of NFT!',
              },
            ]}
          >
            <Input placeholder={tText.price} />
          </Form.Item>
          <Form.Item
            name="files"
            // label="Files"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            // extra="longgggggggggggggggggggggggggggggggggg"
            rules={[
              {
                required: true,
                message: 'Please input the picture of post!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('files') === value) {
                    const file = getFieldValue('files')?.[0]

                    if (file) {
                      const isJpgOrPng =
                        file.type === 'image/jpeg' || file.type === 'image/png'
                      if (!isJpgOrPng) {
                        return Promise.reject(
                          new Error('You can only upload JPG/PNG file!')
                        )
                      }
                      const isLt2M = file.size / 1024 / 1024 < 2
                      if (!isLt2M) {
                        return Promise.reject(
                          new Error('Image must smaller than 2MB!')
                        )
                      }
                    }

                    return Promise.resolve()
                  }

                  return Promise.reject()
                },
              }),
            ]}
          >
            <Upload
              name="picture"
              listType="picture"
              beforeUpload={(file) => {
                // console.log('beforeUpload', file)
                return false
              }}
              maxCount={1}
            >
              <Button
                type="primary"
                style={{
                  backgroundColor: '#0095f6',
                  borderColor: '#0095f6',
                  borderRadius: 4,
                }}
              >
                {tText.sfc}
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Fragment>
  )
})
