import styled from 'styled-components';
import { CardSegment, Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const TableCardSegment = styled(CardSegment)`
  > div {
    border: 1px solid ${NEUTRAL.N100};
    border-radius: 3px;
    overflow: scroll;
  }

  table {
    margin-bottom: -1px;
    min-width: 100%;
    overflow: scroll;
    width: auto;
  }

  td,
  th {
    max-width: 500px;
    min-width: 200px;
    overflow: ${({ noWrap }) => (noWrap ? 'hidden' : undefined)};
    text-overflow: ${({ noWrap }) => (noWrap ? 'ellipsis' : undefined)};
    white-space: ${({ noWrap }) => (noWrap ? 'nowrap' : undefined)};
  }

  th {
    padding: 15px 10px;
  }
`;

export default TableCardSegment;
