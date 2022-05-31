import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  let location = useLocation();

  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
        <br />
        <Link to="/">Back to Home</Link>
      </h3>
    </div>
  );
}

export default NotFound
