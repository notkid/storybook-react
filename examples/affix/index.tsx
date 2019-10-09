import * as React from 'react';
import Affix from '../../src/components/affix';

function AffixExample() {
  return (
    <div style={{ height: '1500px' }}>
      <div style={{height: '600px'}}></div>
      <Affix offsetTop={50}>
        <button>111</button>
      </Affix>
    </div>
  );
}

export default AffixExample;
