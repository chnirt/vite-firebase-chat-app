import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button, Input, List, Row } from 'antd'
import { deleteField } from 'firebase/firestore'
import axios from 'axios'
import { IoIosMusicalNote, IoIosPause, IoIosPlay } from 'react-icons/io'
import debounce from 'lodash/debounce'

// import SpotifyLogo from '../../assets/logo/spotify_logo.png'
// import {
//   SPOTIFY_AUTH_ENDPOINT,
//   SPOTIFY_CLIENT_ID,
//   SPOTIFY_REDIRECT_URI,
//   SPOTIFY_RESPONSE_TYPE,
// } from '../../env'
import { useAuth } from '../../context'
import { getDocRef, updateDocument } from '../../firebase/service'
// import { audioList } from '../../mock'
import { Music } from '../Music'
import { colors } from '../../constants'
import { getSpotifyAccessToken } from '../../utils'
import { t } from 'i18next'

const limit = 5

export const Applications = () => {
  const auth = useAuth()
  const musicRef = useRef(null)
  // const spotifyToken = auth?.user?.spotifyToken
  const backgroundMusic = auth?.user?.backgroundMusic
  const [spotifyToken, setSpotifyToken] = useState(null)

  const [initLoading, setInitLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])

  const [index, setIndex] = useState(0)
  const [isPlay, setIsPlay] = useState(false)

  const [search, setSearch] = useState('')

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

  const handleSetBackgroundMusic = useCallback(async (backgroundMusicData) => {
    const userDocRef = getDocRef('users', auth?.user?.uid)
    const userData = {
      backgroundMusic: backgroundMusicData,
    }
    await updateDocument(userDocRef, userData)

    auth?.fetchUser(auth?.user)
  }, [])

  const handleRemoveBackgroundMusic = useCallback(async () => {
    const userDocRef = getDocRef('users', auth?.user?.uid)
    const userData = {
      backgroundMusic: deleteField(),
    }
    await updateDocument(userDocRef, userData)

    auth?.fetchUser(auth?.user)
  }, [])

  const onLoad = useCallback(async () => {
    if (spotifyToken) {
      try {
        if (search.length === 0) {
          setList([])
          return
        } else {
          const { data } = await axios.get(
            'https://api.spotify.com/v1/search',
            {
              headers: {
                Authorization: `Bearer ${spotifyToken}`,
              },
              params: {
                q: search,
                type: 'track',
                include_external: 'audio',
                offset: page * limit,
                limit,
              },
            }
          )
          // console.log(JSON.stringify(data.tracks.items[0], null, 2))
          setList(data.tracks.items)
        }
      } catch (error) {
        if (error.response.status === 401) {
          handleUnconnectSpotify()
        }
      } finally {
        musicRef?.current?.handleEnded()
        musicRef?.current?.handleSelect(0)
        setIndex(0)

        setInitLoading(false)
        setLoading(false)
      }
    }
  }, [spotifyToken, search])

  const onLoadMore = useCallback(async () => {
    if (spotifyToken) {
      setLoading(true)
      const { data } = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
        params: {
          q: search,
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
  }, [spotifyToken, page, search])

  const debouncedSearchText = debounce(onLoad, 1000)

  useEffect(() => {
    onLoad()
  }, [onLoad])

  useEffect(() => {
    debouncedSearchText()
  }, [search])

  useEffect(() => {
    ; (async () => {
      const spotifyAccessToken = await getSpotifyAccessToken()
      setSpotifyToken(spotifyAccessToken)
    })()
  }, [])

  const loadMore = useMemo(
    () =>
      !initLoading && !loading && list.length > 0 ? (
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
    [initLoading, loading, onLoadMore, list]
  )

  const tText = {
    TYS: t('src.screens.profile.TYS'),
  }

  return (
    <Fragment>
      <div
        style={{
          padding: '32px 32px 0 32px',
          backgroundImage: `linear-gradient(0deg, #ffffff, ${colors.firebase}30)`,
        }}
      >
        {/* <Row align="middle" justify="space-between">
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
        </Row> */}

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

            <Row style={{ marginTop: 32 }}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tText.TYS}
              />
            </Row>

            <Row
              style={{
                marginTop: 32,
              }}
            >
              <List
                style={{
                  flex: 1,
                  height: 'calc(var(--app-height) - 400px)',
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
                  const album = item?.album
                  const image = album?.images[0].url
                  const name = item?.name
                  const nameArtists = item?.artists
                    ?.map((artist) => artist.name)
                    .join(', ')
                  const isSelected = index === ii
                  const preview_url = item?.preview_url
                  const isSelectedBackgroundMusic =
                    backgroundMusic?.preview_url === preview_url
                  const backgroundMusicData = {
                    name,
                    album,
                    preview_url,
                  }
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
                            <IoIosMusicalNote
                              size={18}
                              color={
                                isSelectedBackgroundMusic
                                  ? colors.spotify
                                  : '#767676'
                              }
                              fill={
                                isSelectedBackgroundMusic
                                  ? colors.spotify
                                  : '#767676'
                              }
                            />
                          }
                          onClick={() =>
                            isSelectedBackgroundMusic
                              ? handleRemoveBackgroundMusic()
                              : handleSetBackgroundMusic(backgroundMusicData)
                          }
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
