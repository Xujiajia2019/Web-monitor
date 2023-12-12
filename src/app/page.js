// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { AppProvider, 
  Page, 
  Layout, 
  Frame, 
  Navigation, 
  Loading, 
  SkeletonPage, 
  LegacyCard, 
  TextContainer, 
  SkeletonDisplayText, 
  SkeletonBodyText, 
  Form,
  FormLayout,
  Button,
  TextField } from '@shopify/polaris';
import {
  ArrowLeftMinor,
  HomeMajor,
  OrdersMajor,
  ConversationMinor,
} from '@shopify/polaris-icons';
import { useState, useCallback } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState('');
  const [result, setResult] = useState('');

  const handlePageChange = useCallback(
    (value) => setPage(value),
    [],
  )

  const handleSubmit = useCallback(() => {
    // 向后端接口发请求，将 URL 传过去
    setIsLoading(true)
    fetch('/api/monitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: page })
    })
    .then(res => res.json())
    .then(data => {
      setResult(data.data)
      setIsLoading(false)
    })
  }, [page]);

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: OrdersMajor
          },
          {
            label: 'Content Changes',
            icon: OrdersMajor
          },
          {
            label: 'Notifications',
            icon: OrdersMajor
          },
        ]}
        action={{
          icon: ConversationMinor,
          accessibilityLabel: 'Contact support'
        }}
      />
    </Navigation>
  );


  const actualPageMarkup = (
    <Page title="Account">
      <Layout>
        <Layout.AnnotatedSection
          title="Account details"
          description="Jaded Pixel will use this as your account information."
        >
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                value={page}
                onChange={handlePageChange}
                label="Website URL"
                type="text"
                autoComplete="url"
                helpText={
                  <span>
                   Enter URL to start monitoring.
                  </span>
                }
              />
              <Button submit>Start monitoring</Button>
            </FormLayout>
            {result}
          </Form>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );

  const pageMarkup = actualPageMarkup


  return (
    <AppProvider>
      <Page>
        <Layout>
          <Frame navigation={navigationMarkup}>
            {pageMarkup}
          </Frame>
        </Layout>
      </Page>
    </AppProvider>
  )
}
