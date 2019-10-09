import * as React from 'react';

import { storiesOf } from '@storybook/react';
import AffixExample from '../examples/dnd/copy-or-move';

storiesOf('DnD', module).add('simple', () => <AffixExample />);
