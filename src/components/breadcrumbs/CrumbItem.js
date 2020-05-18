import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRALS } = Colors;

const CrumbItem = styled.span`
  color: ${NEUTRALS[1]};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

export default CrumbItem;
