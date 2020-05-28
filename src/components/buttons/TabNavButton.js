import styled from 'styled-components';

import NavButton from './NavButton';

const GRAY = '#8e929b';
const PURPLE = '#6124e2';

const TabNavButton = styled(NavButton)`
  color: ${(props) => (props.selected ? PURPLE : GRAY)};
  font-weight: ${(props) => (props.selected ? '600' : 'normal')};
  border-bottom: 3px solid ${(props) => (props.selected ? PURPLE : 'transparent')};
  padding-bottom: 15px;
  margin-right: 30px;

  &:hover {
    color: #6124e2;
  }
`;

export default TabNavButton;
