import React, { useState, useCallback } from 'react';
import { Form, FormLayout, TextField, Button } from '@shopify/polaris';

const Starter = ({ setActive, setLogData }) => {
  const [page, setPage] = useState('');

  const handlePageChange = (value) => {
    setPage(value);
  };

  const handleSubmit = useCallback(() => {
    // 向后端接口发请求，将 URL 传过去
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
  }, [page, setActive, setLogData]);


  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        <TextField
          value={page}
          onChange={handlePageChange}
          label="Website URL"
          type="text"
          autoComplete="url"
          helpText={<span>Enter URL to start monitoring.</span>}
        />
        <Button submit>Start monitoring</Button>
      </FormLayout>
    </Form>
  );
};

export default Starter;
