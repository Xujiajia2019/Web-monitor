import React from 'react';

const ContentLogDetail = ({log}) => {
  console.log(log)
  return (
    <div>
      <h1>Content detail</h1>
      <div dangerouslySetInnerHTML={{ __html: log.content }}>
      </div>
    </div>
  );
};

export default ContentLogDetail;
