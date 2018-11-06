/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import leftArrow from '../../assets/svg/left-arrow-dark.svg';
import rightArrow from '../../assets/svg/right-arrow-dark.svg';
import { CHART_COLORS } from '../../utils/constants/Colors';

const PageList = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  list-style: none;
  margin: 0 30px;
  li:last-child {
    width: 24px;
  }
`;

const PageListItem = styled.li`
  width: ${props => ((props.disabled) ? '0' : 'auto')};
  visibility: ${props => ((props.disabled) ? 'hidden' : '')};
  a {
    color: ${props => (props.active ? 'white' : CHART_COLORS[0])};
    background-color: ${props => (props.active ? CHART_COLORS[0] : '')};
    border-radius: ${props => (props.active ? '2px' : '')};
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
  }
  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  onChangePage :() => void,
  activePage :number,
  numResults :number
}

const Pagination = (props :Props) => {

  const { numResults, activePage, onChangePage } = props;
  const frontArrowDisabled = activePage === 1;
  const backArrowDisabled = numResults < 20;

  // `pages` is an array that controls which page is displayed in the pagination controls
  let pages = [activePage];

  const indices = pages.map((page) => {
    const active = activePage === page;

    return (
      <PageListItem key={page} active={active}>
        <a onClick={() => onChangePage(page)}>{page}</a>
      </PageListItem>
    );
  });

  return (
    <PageList>
      <PageListItem disabled={frontArrowDisabled}>
        <a onClick={() => onChangePage(activePage - 1)}>
          <img src={leftArrow} alt="" />
        </a>
      </PageListItem>
      {indices}
      <PageListItem disabled={backArrowDisabled}>
        <a onClick={() => onChangePage(activePage + 1)}>
          <img src={rightArrow} alt="" />
        </a>
      </PageListItem>
    </PageList>
  );
};

export default Pagination;
