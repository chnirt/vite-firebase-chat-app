import React from 'react'
import { Col, Image, Row } from 'antd'

export const PostList = () => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        {[...Array(9).keys()].map((item, pi) => {
          return (
            <Col key={`post-${pi}`} span={8}>
              <Image
                src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
              />
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
