import { useCallback, useState } from 'react'
import { AutoComplete, Input, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'
import { CgSearch } from 'react-icons/cg'
import debounce from 'lodash/debounce'

import { getColRef } from '../../firebase/service'

export const MyAutoComplete = () => {
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState([])
  // options = [
  //   { value: 'light', label: 'Light' },
  //   { value: 'bamboo', label: 'Bamboo' },
  // ];
  let navigate = useNavigate()

  const handleSearch = useCallback(async (searchText) => {
    if (searchText) {
      const formatSearch = searchText.trim().toLowerCase()

      const userColRef = getColRef('users')
      const q = query(
        userColRef,
        where('keywords', 'array-contains', formatSearch)
      )
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        const dataItem = docSnapshot.data()
        return {
          ...dataItem,
          id: docSnapshot.id,
          key: docSnapshot.id,
          label: dataItem.username,
          value: dataItem.username,
        }
      })
      // console.log(data)
      setOptions(data)
      return
    }
    setOptions([])
  }, [])

  const handleSelect = useCallback((searchText) => {
    navigate(`/user/${searchText}`)
  }, [])

  return (
    <div>
      <AutoComplete
        style={{
          width: '100%',
          backgroundColor: '#efefef',
          borderRadius: '8px',
        }}
        options={options}
        onSearch={debounce(handleSearch, 200)}
        onSelect={handleSelect}
        filterOption={(inputValue, option) =>
          option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        }
        notFoundContent={
          <Empty
          // image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        }
        allowClear={true}
        backfill={true}
      // autoFocus={true}
      >
        <Input
          style={{
            borderRadius: '8px',
          }}
          value={search}
          onChange={setSearch}
          placeholder={'Search'}
          prefix={
            <CgSearch
              style={{
                fontSize: 16,
                color: '#767676',
              }}
            />
          }
          bordered={false}
        />
      </AutoComplete>
    </div>
  )
}
