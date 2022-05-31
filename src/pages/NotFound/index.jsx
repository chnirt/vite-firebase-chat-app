import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const NotFound = () => {
  let location = useLocation()
  let navigate = useNavigate()

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <div className="App">
      <h3>
        No match for <code>{location.pathname}</code>
        <br />
        <button onClick={handleBack}>Back</button>
      </h3>
    </div>
  )
}

export default NotFound
