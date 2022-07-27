import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react'

const defaultState = {}

const MetaMaskContext = createContext(defaultState)

export const MetaMaskProvider = ({ children }) => {
  const [haveMetamask, setHaveMetamask] = useState(true)
  const [accountAddress, setAccountAddress] = useState('')
  const [accountBalance, setAccountBalance] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const { ethereum } = window
    const checkMetamaskAvailability = async () => {
      try {
        if (!ethereum) {
          setHaveMetamask(false)
        }
        setHaveMetamask(true)

        const accounts = await ethereum.request({ method: 'eth_accounts' })
        // console.log(accounts)
        if (accounts.length > 0) {
          setAccountAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        setIsConnected(false)
      }
    }
    checkMetamaskAvailability()
  }, [])

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!')
    }
  }, [])

  const connectWallet = useCallback(async () => {
    try {
      if (!ethereum) {
        setHaveMetamask(false)
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      setAccountAddress(accounts[0])
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      haveMetamask,
      isConnected,
      accountAddress,
      accountBalance,
      connectWallet,
    }),
    [haveMetamask, isConnected, accountAddress, accountBalance, connectWallet]
  )

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  )
}

export const useMetaMask = () => useContext(MetaMaskContext)
