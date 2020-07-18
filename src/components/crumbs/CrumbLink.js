import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { Link } from 'react-router-dom';

const { PURPLE } = Colors;

const CrumbLink = styled(Link)`
  color: ${PURPLE.P300};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  text-transform: uppercase;

  :hover {
    text-decoration: underline;
  }
`;

export default CrumbLink;
