// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import ContentMonitorStarter from '../../components/ContentMonitorStarter';
import ContentLogList from '../../components/ContentLogList'

export default function Content() {
  // const [logData, setLogData] = useState([]);
  const [pageListData, setPageListData] = useState([]);

  // 获取数据: 只在组件挂载时执行一次
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('/api/getContentLogList');  // 替换为你的实际 API 端点
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       const data = await response.json(); // 替换为你的获取数据的函数
  //       if (data && data.length > 0) {
  //         console.log(data)
  //         setLogData(data)
  //         setActive(true)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);

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
      { pageListData.length > 0 ? <PageList pageListData={pageListData}></PageList> : <ContentMonitorStarter setPageListData={setPageListData}></ContentMonitorStarter> }
      {/* {active && logData.length > 0 ? <ContentLogList logData={logData}></ContentLogList> : <ContentMonitorStarter setLogData={setLogData} setActive={setActive}></ContentMonitorStarter>} */}
    </div>
  )
}
