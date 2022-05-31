import { useLocation, useNavigate } from 'react-router-dom'

const NotFound = () => {
  let location = useLocation()
  let navigate = useNavigate()

  return (
    <div className='App'>
      <h3>
        No match for <code>{location.pathname}</code>
        <br />
        <button
          onClick={() => {
            navigate(-1)
          }}
        >
          Back
        </button>
      </h3>
    </div>
  )
}

export default NotFound
