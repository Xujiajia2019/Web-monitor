// 使用服务端组件时会与 Polaris 的 createContext 冲突，所以需要使用客户端组件
"use client"
import {
  Button,
  Modal,
  ChoiceList,
  Select,
  TextField
 } from '@shopify/polaris';
import { useState, useEffect, useCallback } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import React from 'react';
import ContentAlertRules from '../../components/ContentAlertRules'

export default function Content() {
  const [rules, setRules] = useState([]);


  const [active, setActive] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState('');
  const [selectedPage, setSelectedPage] = useState('https://sections.bbxlk.cc/');
  const [elements, setElements] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('include');
  const [regx, setRegx] = useState('');
  const handleAlertTypeChange = useCallback((value) => setSelectedAlertType(value), []);
  const handlePageSelectChange = useCallback((value) => setSelectedPage(value), []);
  const handleElementsChange = useCallback((value) => setElements(value), []);
  const handleConditionChange = useCallback((value) => setSelectedCondition(value), []);
  const handleRegxChange = useCallback((value) => setRegx(value), []);

  useEffect(() => {
    // 在组件挂载时获取数据
    const fetchData = async () => {
      try {
        const response = await fetch('/api/getAllAlertRules');  // 替换为你的实际 API 端点
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // 替换为你的获取数据的函数
        if (data && data.length > 0) {
          setRules(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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

  const handleSaveRule = () => {
    // 向后端接口发请求，将 URL 传过去
    fetch('/api/saveAlertRule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: selectedAlertType[0],
        page: selectedPage,
        element: elements,
        condition: selectedCondition,
        value: regx
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      handleClose()
    })
  }

  const activator = <Button onClick={handleModalChange}>Add new rules</Button>;


  return (
    <div>
      <Modal
          activator={activator}
          open={active}
          onClose={handleClose}
          title="Add new rule"
          primaryAction={{
            content: 'Save',
            onAction: handleSaveRule,
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
                {label: 'Page Content', value: 'page_content'}
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
                {label: 'Non-existent', value: 'non_existent'}
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
        {rules.length > 0 ? <ContentAlertRules rules={rules}></ContentAlertRules> : null}
    </div>
  )
}
