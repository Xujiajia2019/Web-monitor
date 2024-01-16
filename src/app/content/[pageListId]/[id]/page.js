// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import {
  Page, 
  Layout,
} from '@shopify/polaris';
import React from 'react';
import ContentLogDetail from '../../../../components/ContentLogDetail'

export default function Detail({params}) {
  const [log, setLog] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/getContentLogList?id=${params.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setLog(data[0])
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [params.id]);

  return (
    <Page title="Page Monitors">
      <Layout>
        <Layout.AnnotatedSection>
          <ContentLogDetail log={log}></ContentLogDetail>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
