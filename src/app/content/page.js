// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import ContentMonitorStarter from '../../components/ContentMonitorStarter';
import ContentLogList from '../../components/ContentLogList'

export default function Content() {
  // 是否已经激活内容监听器
  const [active, setActive] = useState(null);
  const [logData, setLogData] = useState([]);

  useEffect(() => {
    // 在组件挂载时获取数据
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getContentLogList');  // 替换为你的实际 API 端点
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // 替换为你的获取数据的函数
        if (data && data.length > 0) {
          console.log(data)
          setLogData(data)
          setActive(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <div>
      {active && logData.length > 0 ? <ContentLogList logData={logData}></ContentLogList> : <ContentMonitorStarter setLogData={setLogData} setActive={setActive}></ContentMonitorStarter>}
    </div>
  )
}
