import styled, { css } from 'styled-components';

const style = css`
  border-radius: 3px;
  background-color: #e4d8ff;
  color: #6124e2;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 12px;
  width: fit-content;
  border: none;
  text-decoration: none;

  &:hover:not(:disabled) {
    background-color: #d0bbff;
    cursor: pointer;
  }

  &:active {
    background-color: #b898ff;
  }

  &:focus {
    outline: none;
  }
`;

export default styled.button`${style}`;

export const SecondaryLink = styled.a`${style}`;
