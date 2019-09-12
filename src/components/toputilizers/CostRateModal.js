/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronUp, faChevronDown } from '@fortawesome/pro-light-svg-icons';

import NumberInputTable from '../tables/NumberInputTable';
import InfoButton from '../buttons/InfoButton';
import DefaultCostExplanations from './DefaultCostExplanations';
import { TitleText } from '../layout/Layout';
import { isNotNumber } from '../../utils/ValidationUtils';
import { getFqnString } from '../../utils/DataUtils';

type Props = {
  costRates :Map<List<string>, number>,
  entityTypesById :Map<string, *>,
  propertyTypesById :Map<string, *>,
  timeUnit :string,
  onSetCostRate :(newCostRates :Map<List<string>, number>) => void,
  onClose :() => void
};

type State = {
  costRateValues :Map<List<string>, number>,
  showingJustifications :boolean
};

const Wrapper = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  border: none;
  background-color: transparent;
  height: 16px;
  width: 16px;
  color: #b6bbc7;

  &:hover {
    cursor: pointer;
    color: #cbcfd9;
  }

  &:focus {
    outline: none;
  }
`;

const InfoButtonWide = styled(InfoButton)`
  width: 190px;
  justify-self: flex-end;
`;

const JustificationButton = styled.button`
  border: none;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #8e929b;
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    margin-right: 7px;
  }

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`;

export default class CostRateModal extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      costRateValues: props.costRates,
      showingJustifications: false
    };
  }

  componentWillReceiveProps(nextProps :Props) {
    const { costRates } = this.props;
    if (costRates !== nextProps.costRates) {
      this.setState({ costRateValues: nextProps.costRates });
    }
  }

  getTitle = (triplet :List) => {
    const { entityTypesById, propertyTypesById } = this.props;

    const assocTitle = entityTypesById.getIn([triplet.get(0), 'title'], '');
    const neighborTitle = entityTypesById.getIn([triplet.get(1), 'title'], '');
    const ptTitle = propertyTypesById.getIn([triplet.get(2), 'title'], '');

    return `${assocTitle} ${neighborTitle} -- ${ptTitle}`;
  }

  renderTable = () => {
    const { timeUnit } = this.props;
    const { costRateValues } = this.state;

    const rows = costRateValues.entrySeq().map(([triplet, cost]) => fromJS({
      key: triplet,
      label: this.getTitle(triplet),
      value: cost
    }));

    const onChange = (triplet, value) => this.setState({
      costRateValues: costRateValues.set(triplet, value)
    });

    return (
      <NumberInputTable
          keyHeader="Event"
          valueHeader={`Cost/${timeUnit.toLowerCase().slice(0, -1)}`}
          rows={rows}
          onChange={onChange}
          withDollarSign />
    );
  }

  onSubmit = () => {
    const { costRates, onSetCostRate } = this.props;
    const { costRateValues } = this.state;

    let formattedValues = Map();
    costRateValues.entrySeq().forEach(([triplet, numStr]) => {
      const value = isNotNumber(numStr) ? costRates.get(triplet) : Number.parseFloat(numStr);
      formattedValues = formattedValues.set(triplet, value);
    });

    onSetCostRate(formattedValues);
  }

  renderJustificationsButton = () => {
    const { showingJustifications } = this.state;
    const icon = showingJustifications ? faChevronUp : faChevronDown;
    return (
      <JustificationButton onClick={() => this.setState({ showingJustifications: !showingJustifications })}>
        <span>Default cost sources</span>
        <FontAwesomeIcon icon={icon} />
      </JustificationButton>
    );
  }

  renderButtons = (hasJustifications :number) => (
    <HeaderRow>
      {hasJustifications ? this.renderJustificationsButton() : <div />}
      <InfoButtonWide onClick={this.onSubmit}>Set Cost Rate</InfoButtonWide>
    </HeaderRow>
  )

  renderJustifications = () => {
    const { costRates, propertyTypesById } = this.props;
    return costRates.keySeq().map((triplet) => {
      const fqn = getFqnString(propertyTypesById.getIn([triplet.get(2), 'type'], Map()));
      return DefaultCostExplanations[fqn];
    }).filter((val) => !!val);
  }

  render() {
    const { showingJustifications } = this.state;
    const { onClose } = this.props;

    const justifications = this.renderJustifications();

    return (
      <Wrapper>
        <HeaderRow>
          <TitleText>Set cost rate</TitleText>
          <CloseButton onClick={onClose}><FontAwesomeIcon icon={faTimes} size="1x" /></CloseButton>
        </HeaderRow>
        {this.renderTable()}
        {this.renderButtons(justifications.toSet().size)}
        {showingJustifications ? justifications : null}
      </Wrapper>
    );
  }
}
