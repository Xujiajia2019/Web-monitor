import React, {useState, useCallback} from 'react';
import {Card, Tabs} from '@shopify/polaris';

const ContentLogDetail = ({log}) => {
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    selectedTabIndex => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: 'content',
      content: 'Content',
      accessibilityLabel: 'Content',
      panelID: 'all-customers-fitted-content-2',
    },
    {
      id: 'html',
      content: 'Html',
      accessibilityLabel: 'Html',
      panelID: 'accepts-marketing-fitted-Ccontent-2'
    },
  ];

  return (
    <div>
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted>
            
            <Card title={tabs[selected].content}>
              { selected == 0 ? 
              <div dangerouslySetInnerHTML={{ __html: log.diff_content }}>
              </div> : <div dangerouslySetInnerHTML={{ __html: log.diff_html }}>
              </div> }
            </Card>
            
        </Tabs>
      </Card>
    </div>
  );
};

export default ContentLogDetail;
