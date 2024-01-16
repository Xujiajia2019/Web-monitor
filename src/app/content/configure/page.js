// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {
  Page, 
  Layout,
  Form, FormLayout, TextField, Button, Select, Checkbox
} from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import { disable } from '@shopify/app-bridge/actions/LeaveConfirmation';

export default function Content() {
  const [pages, setPages] = useState('');
  const [proxy, setProxy] = useState('none');
  const [sitemap, setSitemap] = useState(false);
  const [timer, setTimer] = useState('1');
  const [range, setRange] = useState('0');
  const [notifications, setNotifications] = useState('');
  const [disabledForm, setDisabledForm] = useState(false);

  const handlePageChange = (value) => {
    setPages(value);
  };

  const handleProxyChange = useCallback(
    value => setProxy(value),
    [],
  );

  const handleSitemapChange = useCallback(
    value => setSitemap(value),
    [],
  );

  const handleTimerChange = useCallback(
    value => setRange(value),
    [],
  );

  const handleRangeChange = useCallback(
    value => setTimer(value),
    [],
  );

  const handleNotificationsChange = useCallback(
    value => setNotifications(value),
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getContentConfigure');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
          console.log(data)
          // 渲染配置数据
          setPages(data[0].url)
          setProxy(data[0].proxy)
          setSitemap(data[0].sitemap)
          setTimer(data[0].monitor_interval)
          setRange(data[0].change_range)
          setNotifications(data[0].notifications)
          setDisabledForm(true)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = useCallback(() => {
    const pageList = pages.split(';');
    // 处理多个 URL，传递数组
    fetch('/api/createContentMonitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pageList, pages, proxy, sitemap, timer, range, notifications })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      // 开始执行定时任务，爬取每个页面的 HTML, 并存储到数据库
      fetch('/api/contentMonitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pageList: data, proxy, sitemap, timer, range, notifications })
      })
      .then(res => res.json())
      .then(data => {
        // 重定向至 content 页面
        window.location.href = '/content';
      })

    })
  }, [notifications, pages, proxy, range, sitemap, timer]);

  const rangeOptions = [
    {label: 'Any change', value: '0'},
    {label: '>=0.1%', value: '0.001'},
    {label: '>=10%', value: '0.1'},
    {label: '>=20%', value: '0.2'},
    {label: '>=30%', value: '0.3'},
    {label: '>=50%', value: '0.5'},
  ];

  const timerOptions = [
    {label: '1min', value: '1'},
    {label: '5min', value: '5'},
    {label: '10min', value: '10'},
    {label: '20min', value: '20'}
  ];

  const proxyOptions = [
    {label: 'None', value: 'none'},
    {label: 'China', value: 'none'},
    {label: 'America', value: 'none'},
  ];

  return (
    <Page title="Page Monitors">
      <Layout>
        <Layout.AnnotatedSection>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                value={pages}
                onChange={handlePageChange}
                label="Website URL"
                type="text"
                autoComplete="url"
                disabled={disabledForm}
                helpText={<span>Enter URL to start monitoring, separated with ';'.</span>}
              />
              <Select
                label="Range of change"
                options={rangeOptions}
                onChange={handleRangeChange}
                disabled={disabledForm}
                value={range}
              />
              <Select
                label="How often are they monitored?"
                options={timerOptions}
                onChange={handleTimerChange}
                disabled={disabledForm}
                value={timer}
              />
              <Select
                label="Proxy"
                options={proxyOptions}
                onChange={handleProxyChange}
                disabled={disabledForm}
                value={proxy}
              />
              <Checkbox
                label="Whether to monitor the sitemap"
                checked={sitemap}
                onChange={handleSitemapChange}
                disabled={disabledForm}
              />
              <TextField
                value={notifications}
                onChange={handleNotificationsChange}
                label="Notifications(webhook url)"
                disabled={disabledForm}
                type="text"
                autoComplete="url"
              />
              <Button disabled={disabledForm} submit>Start monitoring</Button>
            </FormLayout>
          </Form>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  )
}
