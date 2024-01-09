import {Page, Card, DataTable} from '@shopify/polaris';
import React from 'react';

function ContentAlertRules({rules}) {
  const rows = rules.map(item => Object.values(item))

  return (
    <Page title="Alert rules">
      <Card>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
            'text',
            'text',
            'text',
            'text'
          ]}
          headings={[
            'id',
            'Alert type',
            'Page url',
            'Element',
            'Condition',
            'Value',
          ]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}

export default ContentAlertRules;