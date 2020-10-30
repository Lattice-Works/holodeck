import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const CrumbItem = styled.span`
  color: ${NEUTRAL.N500};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  text-transform: ${({ toUpperCase = false }) => (toUpperCase ? 'uppercase' : 'none')};
`;

export default CrumbItem;
