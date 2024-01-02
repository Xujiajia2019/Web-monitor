// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { AppProvider, 
  Page, 
  Layout, 
  Frame, 
  Navigation, 
 } from '@shopify/polaris';
import {
  OrdersMajor,
  ConversationMinor,
} from '@shopify/polaris-icons';
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import ContentMonitorStarter from '../../components/ContentMonitorStarter';
import ContentLogList from '../../components/ContentLogList'

export default function Content() {
  // 是否已经激活内容监听器
  const [active, setActive] = useState(false);

  useEffect(() => {
    // 在组件挂载时获取数据
    const fetchData = async () => {
      try {
        const response = await fetch('/api/logList');  // 替换为你的实际 API 端点
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // 替换为你的获取数据的函数
        if (data && data.length > 0) {
          setLogData(data)
          setActive(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);



  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: OrdersMajor
          },
          {
            label: 'Content Changes',
            icon: OrdersMajor,
            url: '/content'
          },
          {
            label: 'Notifications',
            icon: OrdersMajor
          },
          {
            label: 'Settings',
            icon: OrdersMajor
          }
        ]}
        action={{
          icon: ConversationMinor,
          accessibilityLabel: 'Contact support'
        }}
      />
    </Navigation>
  );


  const actualPageMarkup = (
    <Page title="Account">
      <Layout>
        <Layout.AnnotatedSection
          title="Account details"
          description="Jaded Pixel will use this as your account information."
        >
        {active ? <ContentLogList></ContentLogList> : <ContentMonitorStarter setActive={setActive}></ContentMonitorStarter>}
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );

  const pageMarkup = actualPageMarkup

  return (
    <AppProvider>
      <Page>
        <Layout>
          <Frame navigation={navigationMarkup}>
            {pageMarkup}
          </Frame>
        </Layout>
      </Page>
    </AppProvider>
  )
}
