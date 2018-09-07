/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';

import NavButton from '../buttons/NavButton';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';

const {
  ON_CLICK,
  TITLE
} = BREADCRUMB;

type Crumb = {
  onClick :(index :number) => void,
  label :string
}

const BreadcrumbsWrapper = styled.div`
  margin-bottom: 20px;
`;

const ArrowIcon = styled(FontAwesomeIcon).attrs({
  icon: faChevronRight
})`
  margin: 0 5px;
`;

const isLast = (index, breadcrumbs) => index === breadcrumbs.size - 1;

const Breadcrumbs = ({ breadcrumbs }) => (
  <BreadcrumbsWrapper>
    {
      breadcrumbs.map((crumb :Crumb, index :number) => (
        <NavButton key={index} disabled={isLast(index, breadcrumbs)} onClick={() => crumb[ON_CLICK](index)}>
          {crumb[TITLE]}
          {isLast(index, breadcrumbs) ? null : <ArrowIcon />}
        </NavButton>
      ))
    }
  </BreadcrumbsWrapper>
);

export default Breadcrumbs;
