/*
 * @flow
 */

import React, { Component } from 'react';
import type { Node } from 'react';

import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

import BasicButton from './BasicButton';

const RefWrapper = styled.div`
  width: ${(props) => (props.fullSize ? '100%' : 'auto')};
`;

const SearchableSelectWrapper = styled.div`
  border: none;
  display: flex;
  flex: 0 auto;
  flex-direction: column;
  width: ${(props) => (props.fullSize ? '100%' : 'auto')};
  margin: 0;
  padding: 0;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: row;
  height: ${(props) => (props.short ? '39px' : '45px')};
  position: relative;
`;

const SearchIcon = styled.div`
  align-self: center;
  position: absolute;
  margin: 0 20px;
  right: 0;
  color: ${(props) => (props.open ? '#ffffff' : '#8e929b')}
`;


const SearchButton = styled(BasicButton)`
  width: ${(props) => (props.fullSize ? '100%' : 'auto')};
  font-family: 'Open Sans', sans-serif;
  flex: 1 0 auto;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  padding: 0 45px 0 20px;
  outline: none;
  border: none;
  ${(props) => {
    if (props.open) {
      return css`
        background-color: #8e929b;
        color: #ffffff;

        &:hover {
          background-color: #8e929b !important;
          color: #ffffff !important;
        }
      `;
    }
    return '';
  }}
`;

const DataTableWrapper = styled.div`
  background-color: #fefefe;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
  position: absolute;
  z-index: 1;
  width: 100%;
  visibility: ${(props) => (props.isVisible ? 'visible' : 'hidden')}};
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  margin: ${(props) => (props.openAbove ? '-303px 0 0 0' : '45px 0 0 0')};
  bottom: ${(props) => (props.openAbove ? '45px' : 'auto')};
  max-width: ${(props) => (props.fullSize ? '100%' : '400px')};
  min-width: ${(props) => (props.width ? `${props.width}px` : 'auto')};
  width: ${(props) => (props.fullSize ? '100%' : 'auto')};
`;

type Props = {
  children :Node;
  fullSize ?:boolean;
  openAbove ?:boolean;
  short ?:boolean;
  title :string;
  width :number;
};

type State = {
  isVisibleDataTable :boolean;
};

export default class DropdownButtonWrapper extends Component<Props, State> {

  static defaultProps = {
    fullSize: false,
    openAbove: false,
    short: false,
  }

  node :?HTMLDivElement;

  constructor(props :Props) {
    super(props);
    this.state = {
      isVisibleDataTable: false
    };
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.closeDataTable, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeDataTable, false);
  }

  closeDataTable = (e :MouseEvent) => {
    // $FlowFixMe
    if (this.node && this.node.contains(e.target)) {
      return;
    }
    this.setState({ isVisibleDataTable: false });
  }

  toggleDataTable = (e :SyntheticEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { isVisibleDataTable } = this.state;
    this.setState({
      isVisibleDataTable: !isVisibleDataTable
    });
  }

  setWrapperRef = (ref :any) => {

    this.node = ref;
  }

  render() {

    const { children, short, title } = this.props;
    const { isVisibleDataTable } = this.state;

    /* eslint-disable react/jsx-props-no-spreading */
    return (
      <RefWrapper ref={this.setWrapperRef} {...this.props}>
        <SearchableSelectWrapper isVisibleDataTable={isVisibleDataTable} {...this.props}>
          <SearchInputWrapper short={short}>
            <SearchButton open={isVisibleDataTable} onClick={this.toggleDataTable} {...this.props}>
              {title}
            </SearchButton>
            <SearchIcon open={isVisibleDataTable}>
              <FontAwesomeIcon icon={isVisibleDataTable ? faChevronUp : faChevronDown} />
            </SearchIcon>
          </SearchInputWrapper>
          {
            !isVisibleDataTable
              ? null
              : (
                <DataTableWrapper isVisible={isVisibleDataTable} {...this.props}>
                  {children}
                </DataTableWrapper>
              )
          }
        </SearchableSelectWrapper>
      </RefWrapper>
    );
    /* eslint-enable */
  }
}
