/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';

const ModalBody :ComponentType<{|
  children ?:any;
  width ?:string;
|}> = styled.div`
  max-width: 100%;
  width: ${({ width }) => ((typeof width === 'number' && width > 0) ? width : 720)}px;
`;

export default ModalBody;
