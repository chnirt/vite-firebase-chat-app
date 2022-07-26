import { ethers } from 'ethers'
import { createContext, useContext, useState, useMemo, useEffect } from 'react'

const defaultState = {}

const MetaMaskContext = createContext(defaultState)

export const MetaMaskProvider = ({ children }) => {
  const [haveMetamask, setHaveMetamask] = useState(true)
  const [accountAddress, setAccountAddress] = useState('')
  const [accountBalance, setAccountBalance] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  const { ethereum } = window
  const provider = new ethers.providers.Web3Provider(window.ethereum)

  useEffect(() => {
    const { ethereum } = window
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        setHaveMetamask(false)
      }
      setHaveMetamask(true)
    }
    checkMetamaskAvailability()
  }, [])

  const connectWallet = async () => {
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
  }

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
      {haveMetamask ? (
        <div>
          {isConnected ? (
            <div>
              {children}
              {/* <div className="card-row">
                <h3>Wallet Address:</h3>
                <p>
                  {accountAddress.slice(0, 4)}...
                  {accountAddress.slice(38, 42)}
                </p>
              </div>
              <div className="card-row">
                <h3>Wallet Balance:</h3>
                <p>{accountBalance}</p>
              </div> */}
            </div>
          ) : (
            <>
              {/* <img src={logo} className="App-logo" alt="logo" /> */}
              <p>🎉 Logo</p>
            </>
          )}
          {isConnected ? (
            <p>🎉 Connected Successfully</p>
          ) : (
            <button onClick={connectWallet}>
              Connect
            </button>
          )}
        </div>
      ) : (
        <p>Please Install MataMask</p>
      )}
    </MetaMaskContext.Provider>
  )
}

export const useMetaMask = () => useContext(MetaMaskContext)
