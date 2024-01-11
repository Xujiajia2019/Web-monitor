import React from 'react';
import {
  Card,
  ResourceList,
  ResourceItem,
  Text
} from '@shopify/polaris';

const PageList = ({ pageListData }) => {
  return (
    <div>
      <h1>Content Monitors</h1>
      <Card>
        <ResourceList
          resourceName={{singular: 'page', plural: 'pages'}}
          items={logData}
          renderItem={(item) => {1
            const {id, url, created_at} = item;

            // 将 created_at 字符串转为 Date 对象
            const createdAtDate = new Date(created_at);
            // 格式化日期时间字符串
            const formattedCreatedAt = createdAtDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: false, // 24 小时制
              timeZone: 'Asia/Shanghai', // 北京时区
            });

            return (
              <ResourceItem
                id={id}
                url={`/content/${id}`}
                accessibilityLabel={`View details`}
                persistActions
              >
                <Text variant="bodyMd" fontWeight="bold" as="h3">
                  {url}
                </Text>
                <div>Start at {formattedCreatedAt}</div>
              </ResourceItem>
          );
          }}
        />
      </Card>
    </div>
  );
};

export default PageList;