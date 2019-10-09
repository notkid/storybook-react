import React from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Dustbin from './Dustbin';
import Box from './Box';
const Container: React.FC = () => (
  <DndProvider backend={HTML5Backend} options={undefined} debugMode={true}>
    <div>
      <div style={{ overflow: 'hidden', clear: 'both' }}>
        <Dustbin allowedDropEffect="any" />
        <Dustbin allowedDropEffect="copy" />
        <Dustbin allowedDropEffect="move" />
      </div>
      <div style={{ overflow: 'hidden', clear: 'both' }}>
        <Box name="Glass" />
        <Box name="Banana" />
        <Box name="Paper" />
      </div>
    </div>
  </DndProvider>
);
export default Container;
