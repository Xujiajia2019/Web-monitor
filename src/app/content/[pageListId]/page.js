// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { useState, useEffect } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import PageContentLogList from '../../../components/PageContentLogList'

export default function Detail({params}) {
  const [pageLogList, setPageLogList] = useState([]);

  // 获取某个 ListID 的 所有 LOG 数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/getContentLogList?pageListId=${params.pageListId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setPageLogList(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [params.pageListId]);

  return (
    <div>
      <PageContentLogList pageId={params.pageListId} pageLogList={pageLogList}></PageContentLogList>
    </div>
  )
}
