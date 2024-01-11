import React, { useState, useCallback } from 'react';
import { Form, FormLayout, TextField, Button } from '@shopify/polaris';

const Starter = ({ setPageListData }) => {
  const [pages, setPages] = useState('');

  const handlePageChange = (value) => {
    setPages(value);
  };


  const handleSubmit = useCallback(() => {
    // 处理多个 URL
    fetch('/api/contentMonitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: page })
    })
    .then(res => res.json())
    .then(data => {
      setLogData(data)
      setActive(true)
    })
  }, []);


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
        <Button submit>Start monitoring</Button>
      </FormLayout>
    </Form>
  );
};

export default Starter;
