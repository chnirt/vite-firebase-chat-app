
import { Outlet } from 'react-router-dom'
import { Button } from 'antd';

const Home = () => {
  return (
    <div>
      Home
      <br />
      <Button type="primary">Button</Button>

      <Outlet />
    </div>
  )
}

export default Home
