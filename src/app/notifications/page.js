// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import { AppProvider, 
  Page, 
  Layout, 
  Frame, 
  Navigation,
  Button,
  Modal,
  ChoiceList,
  Select,
  TextField
 } from '@shopify/polaris';
import {
  OrdersMajor,
  ConversationMinor,
} from '@shopify/polaris-icons';
import { useState, useEffect, useCallback } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
// import AlertRules from '../../components/AlertRules'

export default function Content() {
  // const [rules, setRules] = useState([]);


  const [active, setActive] = useState([]);
  const [selectedAlertType, setSelectedAlertType] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [elements, setElements] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [regx, setRegx] = useState('');
  const handleAlertTypeChange = useCallback((value) => setSelectedAlertType(value), []);
  const handlePageSelectChange = useCallback((value) => setSelectedPage(value), []);
  const handleElementsChange = useCallback((value) => setElements(value), []);
  const handleConditionChange = useCallback((value) => setSelectedCondition(value), []);
  const handleRegxChange = useCallback((value) => setRegx(value), []);

  // Add new rules button
  const handleModalChange = useCallback(() => setActive(!active), [active]);
  const handleClose = () => {
    handleModalChange();
    handleAlertTypeChange('');
    handlePageSelectChange('');
    handleElementsChange('');
    handleConditionChange('');
    handleRegxChange('');
  };

  const activator = <Button onClick={handleModalChange}>Add new rules</Button>;


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
            icon: OrdersMajor,
            url: '/content'
          },
          {
            label: 'Notifications',
            icon: OrdersMajor,
            url: '/notifications'
          },
          {
            label: 'Settings',
            icon: OrdersMajor
          }
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
          title="Notifications"
          description="Jaded Pixel will use this as your account information."
        >
        <Modal
          activator={activator}
          open={active}
          onClose={handleClose}
          title="Add new rule"
          primaryAction={{
            content: 'Save',
            onAction: handleClose,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleClose,
            },
          ]}
        >
          <Modal.Section>
            <ChoiceList
              title="Alert type"
              choices={[
                {label: 'Page Content', value: 'page_content'},
                {label: 'JS Error', value: 'js_error'}
              ]}
              selected={selectedAlertType}
              onChange={handleAlertTypeChange}
            />
            <Select
              label="Select Page"
              options={[
                {label: 'Homepage', value: 'https://sections.bbxlk.cc/'}
              ]}
              onChange={handlePageSelectChange}
              value={selectedPage}
            />
            <TextField
              label="Elements id"
              value={elements}
              onChange={handleElementsChange}
              autoComplete="off"
            />
            <Select
              label="Condition"
              options={[
                {label: 'Include', value: 'include'},
                {label: 'Exclude', value: 'exclude'},
                {label: 'Exist', value: 'exist'},
                {label: 'Non-existent', value: 'non-existent'}
              ]}
              onChange={handleConditionChange}
              value={selectedCondition}
            />
            <TextField
              label="regular expression"
              value={regx}
              onChange={handleRegxChange}
              autoComplete="off"
            />
          </Modal.Section>
        </Modal>
        <h2>Notifications</h2>
        {/* {activator} */}
        {/* {rules.length > 0 ? <AlertRules rules={rules}></AlertRules> : null} */}
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
