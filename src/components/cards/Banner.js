import styled from 'styled-components';

export default styled.span`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 8.5px;
  background-color: ${props => (props.secondary ? '#b6bbc7' : '#8045ff')};
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  height: min-content;
  padding: 2px 6px;
  min-width: 25px;
`;
