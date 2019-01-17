import React from 'react';
import styled, { keyframes } from 'styled-components';

const BounceDelay = keyframes`
  0%, 80%, 100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
`;

const Wrapper = styled.div`
  width: 70px;
  text-align: center;

  div {
    width: 10px;
    height: 10px;
    background-color: #b898ff;

    border-radius: 100%;
    display: inline-block;
    animation: ${BounceDelay} 1.4s infinite ease-in-out both;

    &:first-child {
      -webkit-animation-delay: -0.32s;
      animation-delay: -0.32s;
    }

    &:nth-child(even) {
      -webkit-animation-delay: -0.16s;
      animation-delay: -0.16s;
    }
  }
`;

const LoadingDots = () => (
  <Wrapper>
    <div />
    <div />
    <div />
  </Wrapper>
);

export default LoadingDots;
