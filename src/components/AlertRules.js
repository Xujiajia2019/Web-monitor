import React, { useState } from 'react';
import {
  Card,
  ResourceList,
  Avatar,
  ResourceItem,
  Text,
} from '@shopify/polaris';

const AlertRules = ({rules}) => {
  return (
    <div>
      <h1>Loglist</h1>
      <Card>
        <ResourceList
          resourceName={{singular: 'log', plural: 'logs'}}
          items={logData}
          renderItem={(item) => {
            const {id, url, content, created_at} = item;

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
            // const shortcutActions = latestOrderUrl
            //   ? [
            //       {
            //         content: 'View details',
            //         accessibilityLabel: `View latest order`,
            //         url: latestOrderUrl,
            //       },
            //     ]
            //   : undefined;

            return (
              <ResourceItem
                id={id}
                url={`/content/${id}`}
                accessibilityLabel={`View details`}
                // shortcutActions={shortcutActions}
                persistActions
              >
                <Text variant="bodyMd" fontWeight="bold" as="h3">
                  {url}
                </Text>
                <div>{formattedCreatedAt}</div>
              </ResourceItem>
          );
          }}
        />
      </Card>
    </div>
  );
};

export default AlertRules;
