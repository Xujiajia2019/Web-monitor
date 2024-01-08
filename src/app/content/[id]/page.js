// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import LogDetail from '../../../components/LogDetail'

export default function Detail({params}) {
  const [log, setLog] = useState({});

  useEffect(() => {
    // 在组件挂载时获取数据
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getLogList');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const targetLog = data.find(log => log.id == params.id)
          console.log(targetLog)
          setLog(targetLog)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.id]);

  return (
    <div>
      <LogDetail log={log}></LogDetail>
    </div>
  )
}
