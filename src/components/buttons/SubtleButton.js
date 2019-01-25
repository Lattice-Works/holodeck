import styled from 'styled-components';

export default styled.button`
  padding: 7px 20px;
  border-radius: 3px;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;

  font-size: 12px;
  font-weight: 600;
  line-height: normal;
  color: #8e929b;

  &:hover:enabled {
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`;
