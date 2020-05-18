import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { Link } from 'react-router-dom';

const { PURPLES } = Colors;

const CrumbLink = styled(Link)`
  color: ${PURPLES[1]};
  font-size: 0.75rem;
  text-decoration: none;
  text-transform: uppercase;

  :hover {
    text-decoration: underline;
  }
`;

export default CrumbLink;
