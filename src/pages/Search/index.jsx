import { useState } from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { useFetch } from '../../firebase/hooks'
import { useEffect } from 'react'

const Search = () => {
  const [search, setSearch] = useState('')
  const {
    loading,
    data: photos,
    fetchData,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('users', 3)

  useEffect(() => {
    const formatSearch = search.trim().toLowerCase()
    fetchData(formatSearch.length ? formatSearch : null)
  }, [search])

  return (
    <div>
      Search
      <br />
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <div
        style={{
          height: 500,
          overflowY: 'scroll',
          paddingTop: 8,
          paddingBottom: 8,
          border: 'solid 1px black',
        }}
      >
        {loading && <span>Collection: Loading...</span>}
        {photos.length > 0 && (
          <div>
            {photos.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: 'solid 1px black',
                  margin: 8,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Link to={`/users/${doc.uid}`}>@{doc.uid}</Link>
                <p>{doc.email}</p>
                <p>{moment(doc.createdAt?.toDate()).fromNow()}</p>
              </div>
            ))}
          </div>
        )}
        {!loadedAll ? (
          moreLoading ? (
            <span>Collection: Loading...</span>
          ) : (
            <button onClick={handleLoadMore}>Load more</button>
          )
        ) : null}
      </div>
    </div>
  )
}

export default Search
