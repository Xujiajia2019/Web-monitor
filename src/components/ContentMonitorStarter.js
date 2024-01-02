import React, { useState, useCallback } from 'react';
import { Form, FormLayout, TextField, Button } from '@shopify/polaris';

const Starter = ({ setActive }) => {
  const [page, setPage] = useState('');

  const handlePageChange = (value) => {
    setPage(value);
  };

  const handleSubmit = useCallback(() => {
    // 向后端接口发请求，将 URL 传过去
    fetch('/api/monitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: page })
    })
    .then(res => res.json())
    .then(data => {
      const content = data.content
      console.log(content)
      setActive(true)
    })
  }, [page]);


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
