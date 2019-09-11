/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List } from 'immutable';

import downArrowIcon from '../../assets/svg/down-arrow.svg';
import BasicButton from './BasicButton';
import StyledCheckbox from '../controls/StyledCheckbox';

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
  color: #687F96;
  position: absolute;
  margin: 0 20px;
  right: 0;
`;


const SearchButton = styled(BasicButton)`
  width: ${(props) => (props.fullSize ? '100%' : 'auto')};
  font-family: 'Open Sans', sans-serif;
  flex: 1 0 auto;
  font-size: 14px;
  letter-spacing: 0;
  padding: 0 45px 0 20px;
  outline: none;
  border: none;
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
  width: ${(props) => (props.fullSize ? '100%' : 'auto')};
`;

const SearchOptionContainer = styled.div`
  max-height: 300px;
  overflow-x: auto;
  overflow-y: scroll;
  padding: 20px;
  text-align: left;

  &::-webkit-scrollbar {
    display: none;
  }
`;

type Props = {
  fullSize ?:boolean;
  onChange :Function;
  openAbove ?:boolean;
  options :{ label :string, onClick :() => void }[];
  selected :List<any>;
  short ?:boolean;
  title :string;
};

type State = {
  isVisibleDataTable :boolean;
};

export default class CheckboxDropdownButton extends Component<Props, State> {

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

  renderTable = () => {

    const { onChange, options, selected } = this.props;

    const tableOptions = options.map((option :Object) => (
      <StyledCheckbox
          onChange={onChange}
          label={option.label}
          value={option.value}
          checked={selected.includes(option.value)} />
    ));
    return <SearchOptionContainer>{tableOptions}</SearchOptionContainer>;
  }

  setWrapperRef = (ref :any) => {

    this.node = ref;
  }

  render() {

    const { title, short } = this.props;
    const { isVisibleDataTable } = this.state;

    /* eslint-disable react/jsx-props-no-spreading */
    return (
      <RefWrapper ref={this.setWrapperRef} {...this.props}>
        <SearchableSelectWrapper isVisibleDataTable={isVisibleDataTable} {...this.props}>
          <SearchInputWrapper short={short}>
            <SearchButton onClick={this.toggleDataTable} {...this.props}>
              {title}
            </SearchButton>
            <SearchIcon>
              <img src={downArrowIcon} alt="" />
            </SearchIcon>
          </SearchInputWrapper>
          {
            !isVisibleDataTable
              ? null
              : (
                <DataTableWrapper isVisible={isVisibleDataTable} {...this.props}>
                  {this.renderTable()}
                </DataTableWrapper>
              )
          }
        </SearchableSelectWrapper>
      </RefWrapper>
    );
    /* eslint-enable */
  }
}
