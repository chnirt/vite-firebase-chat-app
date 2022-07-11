import { Col, Image, Row } from 'antd'

export const PostList = ({ data = [] }) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        {data.length > 0 &&
          data.map((post, pi) => {
            const src = post.files[0].file
            return (
              <Col key={`post-${pi}`} span={8}>
                <Image src={src} />
              </Col>
            )
          })}
      </Row>
    </div>
  )
}
