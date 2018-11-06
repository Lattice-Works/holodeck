/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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
  numPages :number,
  activePage :number
}

// pagination start page is START_PAGE
const START_PAGE = 1;
// only MAX_PAGE_DISPLAY pages are displayed in the pagination controls.
const MAX_PAGE_DISPLAY = 1;
// if the active page is less than SHIFT_THRESHOLD,
// the pages displayed in the pagination controls does not shift.
const SHIFT_THRESHOLD = 3;

const Pagination = (props :Props) => {

  const { numPages } = props;
  const { activePage } = props;
  const { onChangePage } = props;
  const frontArrowDisabled = activePage === 1;
  const frontJumpDisabled = (activePage <= SHIFT_THRESHOLD) || (numPages <= MAX_PAGE_DISPLAY);
  const backArrowDisabled = activePage === numPages;
  const backJumpDisabled = (activePage > numPages - SHIFT_THRESHOLD) || (numPages <= MAX_PAGE_DISPLAY);

  // `pages` is an array that controls which pages are displayed in the pagination controls
  let pages = [activePage];
  let end;

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
      <PageListItem>
        <a onClick={() => onChangePage(activePage + 1)}>
          <img src={rightArrow} alt="" />
        </a>
      </PageListItem>
    </PageList>
  );
};

export default Pagination;
