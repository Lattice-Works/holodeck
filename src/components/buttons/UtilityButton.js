import styled from 'styled-components';

export default styled.button`
  border-radius: 3px;
  background-color: #f0f0f7;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #8e929b;
  padding: 8px 20px;
  border: none;

  &:hover {
    cursor: pointer;
    background-color: #dcdce7
  }

  &:focus {
    outline: none;
  }
`;
