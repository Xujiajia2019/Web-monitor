// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import ContentMonitorStarter from '../../components/ContentMonitorStarter';
import PageList from '../../components/PageList'

export default function Content() {
  const [pageListData, setPageListData] = useState([]);
  const [status, setStatus] = useState('No pages are being monitored');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getPageList');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // 替换为你的获取数据的函数
        if (data && data.length > 0) {
          console.log(data)
          setStatus('Monitoring')
          setPageListData(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div title='Dashboard'>
      <div>{status}</div>
      { pageListData.length > 0 ? <PageList pageListData={pageListData}></PageList> : <ContentMonitorStarter setStatus={setStatus} setPageListData={setPageListData}></ContentMonitorStarter> }
    </div>
  )
}
