import React, { useState, useCallback } from 'react';
import { Form, FormLayout, TextField, Button, Select, Checkbox } from '@shopify/polaris';

const Starter = ({ setPageListData, setStatus }) => {
  const [pages, setPages] = useState('');
  const [proxy, setProxy] = useState('');
  const [sitemap, setSitemap] = useState(false);
  const [timer, setTimer] = useState('');
  const [range, setRange] = useState('');

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


  const handleSubmit = useCallback(() => {
    const pageList = pages.split(';');
    // 处理多个 URL，传递数组
    fetch('/api/createContentMonitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pageList })
    })
    .then(res => res.json())
    .then(data => {
      // 处理多个 URL
      setPageListData(data)
      setStatus('Monitor initialization in preparation')

      // 开始执行定时任务，爬取每个页面的 HTML, 并存储到数据库
      fetch('/api/contentMonitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pageList: data, proxy, sitemap, timer, range })
      })
      .then(res => res.json())
      .then(data => {
        setStatus('Timed task created, monitoring')
      })

    })
  }, [pages, proxy, range, setPageListData, setStatus, sitemap, timer]);

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
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        <TextField
          value={pages}
          onChange={handlePageChange}
          label="Website URL"
          type="text"
          autoComplete="url"
          helpText={<span>Enter URL to start monitoring, separated with ';'.</span>}
        />
        <Select
          label="Range of change"
          options={rangeOptions}
          onChange={handleRangeChange}
          value={range}
        />
        <Select
          label="How often are they monitored?"
          options={timerOptions}
          onChange={handleTimerChange}
          value={timer}
        />
        <Select
          label="Proxy"
          options={proxyOptions}
          onChange={handleProxyChange}
          value={proxy}
        />
        <Checkbox
          label="Whether to monitor the sitemap"
          checked={sitemap}
          onChange={handleSitemapChange}
        />
        <Button submit>Start monitoring</Button>
      </FormLayout>
    </Form>
  );
};

export default Starter;
