import { Margins } from '@rocket.chat/fuselage';
import type { ReactElement, ReactNode } from 'react';

import { Surface } from './Surface';

type ContextualBarSurfaceProps = {
  children?: ReactNode;
};

const ContextualBarSurface = ({
  children,
}: ContextualBarSurfaceProps): ReactElement => (
  <Surface type='modal'>
    <Margins blockEnd='x16'>{children}</Margins>
  </Surface>
);

export default ContextualBarSurface;
