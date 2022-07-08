
import { Outlet } from 'react-router-dom'
import { Button } from 'antd';

const Home = () => {
  return (
    <div>
      <Outlet />
      Home
      <br />
      <Button type="primary">Button</Button>
      {[...Array(100).keys()].map((a, ai) => {
        return (
          <p key={ai}>{a}</p>
        )
      })}
    </div>
  )
}

export default Home
