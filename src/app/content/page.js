// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import {
  Page, 
  Layout,
  EmptyState,
  Card,
  PageActions
} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
// import ContentMonitorStarter from '../../components/ContentMonitorStarter';
import PageList from '../../components/PageList'

export default function Content() {
  const [pageListData, setPageListData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getPageList');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // 替换为你的获取数据的函数
        if (data && data.length > 0) {
          setPageListData(data)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    };

    fetchData();
  }, []);

  return (
    <Page title="Page Monitors">
      <Layout>
        <Layout.AnnotatedSection>
          <div>
            { !loading && pageListData.length > 0 ? 
              <div>
                <PageActions
                  primaryAction={{
                    content: 'Edit configuration',
                    url: `/content/configure`,
                  }}
                />
                <PageList pageListData={pageListData}></PageList>
              </div>
              : 
              !loading && (<Card sectioned>
                <EmptyState
                  heading="Manage your page content monitors"
                  action={{content: 'Add page monitors', url: '/content/configure'}}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                </EmptyState>
              </Card>)
            }
          </div>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
    
  )
}
