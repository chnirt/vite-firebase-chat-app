import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button, Image, List, Row, Typography } from 'antd'
import { deleteField } from 'firebase/firestore'
import axios from 'axios'
import { IoIosPause, IoIosPlay } from 'react-icons/io'

import SpotifyLogo from '../../assets/logo/spotify_logo.png'
import {
  SPOTIFY_AUTH_ENDPOINT,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_RESPONSE_TYPE,
} from '../../env'
import { useAuth } from '../../context'
import { getDocRef, updateDocument } from '../../firebase/service'
// import { audioList } from '../../mock'
import { Music } from '../Music'
import { colors } from '../../constants'
import { getSpotifyAccessToken } from '../../utils'

const limit = 15

export const Applications = () => {
  const auth = useAuth()
  const musicRef = useRef(null)
  const spotifyToken = auth?.user?.spotifyToken
  // const [spotifyToken, setSpotifyToken] = useState(null)

  const [initLoading, setInitLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])

  const [index, setIndex] = useState(0)
  const [isPlay, setIsPlay] = useState(false)

  const handleUnconnectSpotify = useCallback(async () => {
    const userDocRef = getDocRef('users', auth?.user?.uid)
    const userData = {
      spotifyToken: deleteField(),
    }
    await updateDocument(userDocRef, userData)

    auth?.fetchUser(auth?.user)
  }, [])

  const handleStateChange = useCallback((state) => {
    setIsPlay(state)
  }, [])

  const onLoad = useCallback(async () => {
    if (spotifyToken) {
      try {
        const { data } = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
          params: {
            q: '2am',
            type: 'track',
            include_external: 'audio',
            offset: page * limit,
            limit,
          },
        })
        // console.log(JSON.stringify(data.tracks.items[0], null, 2))
        setList(data.tracks.items)
      } catch (error) {
        if (error.response.status === 401) {
          handleUnconnectSpotify()
        }
      } finally {
        setInitLoading(false)
      }
    }
  }, [spotifyToken])

  const onLoadMore = useCallback(async () => {
    if (spotifyToken) {
      setLoading(true)
      const { data } = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          q: '2am',
          type: 'track',
          offset: (page + 1) * limit,
          limit,
        },
      })
      // console.log(JSON.stringify(data.tracks.items[0], null, 2))
      setPage((prevState) => prevState + 1)
      setList((prevState) => prevState.concat(data.tracks.items))
      setLoading(false)
      window.dispatchEvent(new Event('resize'))
    }
  }, [spotifyToken, page])

  useEffect(() => {
    onLoad()
  }, [onLoad])

  // useEffect(() => {
  //   (async () => {
  //     const spotifyAccessToken = await getSpotifyAccessToken()
  //     setSpotifyToken(spotifyAccessToken)
  //   })()
  // }, [])

  const loadMore = useMemo(
    () =>
      !initLoading && !loading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
            marginBottom: 12,
          }}
        >
          <Button onClick={onLoadMore}>loading more</Button>
        </div>
      ) : null,
    [initLoading, loading, onLoadMore]
  )

  return (
    <Fragment>
      <div style={{ margin: '32px 32px 0 32px' }}>
        <Row align="middle" justify="space-between">
          <Row align="middle" justify="space-between">
            <div style={{ marginRight: 8 }}>
              <Image src={SpotifyLogo} width={30} preview={false} />
            </div>
            <Typography.Text>Spotify</Typography.Text>
          </Row>
          {spotifyToken ? (
            <Button
              style={{
                padding: 0,
              }}
              type="link"
              danger
              onClick={handleUnconnectSpotify}
            >
              UNCONNECT
            </Button>
          ) : (
            <Button
              style={{
                padding: 0,
              }}
              type="link"
              danger
              target="_blank"
              href={`${SPOTIFY_AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=${SPOTIFY_RESPONSE_TYPE}`}
            >
              CONNECT
            </Button>
          )}
        </Row>

        {spotifyToken && (
          <div>
            <Row
              style={{
                marginTop: 32,
              }}
            >
              <Music
                ref={musicRef}
                data={list}
                onStateChange={handleStateChange}
              />
            </Row>

            <Row>
              <List
                style={{
                  flex: 1,
                  height: 'calc(var(--app-height) - 236px)',
                  overflow: 'hidden scroll',
                  // padding: '0 16px',
                  // border: '1px solid rgba(140, 140, 140, 0.35)',
                }}
                // header={<div>Header</div>}
                // footer={<div>Footer</div>}
                // bordered
                loading={initLoading}
                itemLayout="horizontal"
                loadMore={loadMore}
                dataSource={list}
                renderItem={(item, ii) => {
                  const image = item?.album?.images[0].url
                  const name = item?.name
                  const nameArtists = item?.artists
                    ?.map((artist) => artist.name)
                    .join(', ')
                  const isSelected = index === ii
                  return (
                    <List.Item
                      actions={[
                        <Button
                          style={{
                            border: 0,
                            boxShadow: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          ghost
                          shape="circle"
                          icon={
                            isSelected && isPlay ? (
                              <IoIosPause
                                size={18}
                                color={isSelected ? colors.spotify : '#767676'}
                                fill={isSelected ? colors.spotify : '#767676'}
                              />
                            ) : (
                              <IoIosPlay
                                size={18}
                                color={isSelected ? colors.spotify : '#767676'}
                                fill={isSelected ? colors.spotify : '#767676'}
                              />
                            )
                          }
                          onClick={() => {
                            if (isSelected) {
                              musicRef?.current?.handlePausePlayClick()
                              return
                            }
                            musicRef?.current?.handleSelect(ii)
                            musicRef?.current?.handlePlayClick()
                            setIndex(ii)
                          }}
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <img
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 8,
                            }}
                            src={image}
                          />
                        }
                        title={<a href="https://ant.design">{name}</a>}
                        description={nameArtists}
                      />
                    </List.Item>
                  )
                }}
              />
            </Row>
          </div>
        )}
      </div>
    </Fragment>
  )
}
