import { Skeleton } from "antd";
import React from "react";

export const LoadingChatList = () => {
  return <div
    style={{
      padding: '8px 20px',
    }}
  >
    {[...Array(3).keys()].map((loadingChat, lci) => (
      <Skeleton
        key={`loading-chat-${lci}`}
        loading={true}
        active
        avatar
        paragraph={{ rows: 1 }}
      />
    ))}
  </div>;
};
