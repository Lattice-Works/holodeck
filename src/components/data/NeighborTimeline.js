/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { DatePicker } from '@atlaskit/datetime-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowUp, faLongArrowDown } from '@fortawesome/pro-solid-svg-icons';

import BasicButton from '../buttons/BasicButton';
import InfoButton from '../buttons/InfoButton';
import HorizontalTimeline from './HorizontalTimeline';
import TimelineRow from './TimelineRow';
import DropdownButtonWrapper from '../buttons/DropdownButtonWrapper';
import StyledCheckbox from '../controls/StyledCheckbox';
import { DATE_DATATYPES } from '../../utils/constants/DataModelConstants';
import { DATE_FORMAT } from '../../utils/constants/DateTimeConstants';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';

type Props = {
  neighbors :Map<string, Map<string, Map<*, *>>>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  entityTypesById :Map<string, *>,
  entitySetsById :Map<string, *>,
  entitiesById :Map<string, *>,
  onSelectEntity :({ entitySetId :string, entity :Map<*, *> }) => void
};

type State = {
  orderedNeighbors :List<*>,
  dateTypeOptions :Map<*, *>,
  selectedDateTypes :Map<*, *>,
  reverse :boolean,
  startDateInput :string,
  endDateInput :string,
  startDate :string,
  endDate :string
};

type DateEntry = {
  entitySetId :string,
  entityKeyId :string,
  propertyTypeFqn :string,
  date :string,
  neighbor :Map<*, *>
}

const Wrapper = styled.div`
  width: 100%;

  h1 {
    font-family: 'Open Sans';
    font-size: 20px;
    font-weight: 600;
    color: #2e2e34;
    margin: 50px 0 20px 0;
  }
`;

const SkinnyBasicButton = styled(BasicButton)`
  padding: 10px;
`;

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PaddedColumnWrapper = styled(ColumnWrapper)`
  padding: 20px;
`;

const EventRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 0;
  justify-content: space-between;
`;

const DateLabel = styled.div`
  display: flex;
  flex-direction: row;
  font-family: 'Open Sans', sans-serif;
  font-size: 20px;
  color: #555e6f;

  div:first-child {
    font-weight: bold;
    width: 50px;
    margin-right: 20px;
  }

  div:last-child {
    width: 150px;
  }
`;

const MarginLeftWrapper = styled.div`
  margin-left: 20px;
`;

const OptionsBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  width: ${props => (props.fullSize ? '100%' : '33%')};
`;

const InputLabel = styled.span`
  color: #8e929b;
  margin-bottom: 10px;
  font-size: 14px;
`;

const TitleInputLabel = styled(InputLabel)`
  margin-bottom: 20px;
`;

const DatePickerWrapper = styled.div`
  width: 100%;
`;

const FullWidthInfoButton = styled(InfoButton)`
  width: 100%;
`;

const DisplayOptionGroup = styled.div`
  display: flex;
  flex-direction:column;

  &:not(:last-child) {
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px solid #e1e1eb;
  }
`;

const DisplayOptionRow = styled.div`
  display: flex;
  flex-direction: row;
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: 400;
  color: #2e2e34;
  margin: 8px 0 8px 30px;
  align-items: flex-start;

  &:first-child {
    font-weight: 600;
    margin-left: 0;
  }
`;

export default class NeighborTimeline extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const { orderedNeighbors, dateTypeOptions } = this.preprocessProps(props);

    this.state = {
      orderedNeighbors,
      dateTypeOptions,
      selectedDateTypes: dateTypeOptions,
      reverse: false,
      startDate: undefined,
      endDate: undefined,
      startDateInput: undefined,
      endDateInput: undefined
    };
  }

  getDatePropertyTypeIds = (propertyTypesById) => {
    let dateIds = Set();
    propertyTypesById.valueSeq().forEach((propertyType) => {
      if (DATE_DATATYPES.includes(propertyType.get('datatype'))) {
        dateIds = dateIds.add(propertyType.get('id'));
      }
    });
    return dateIds;
  }

  getDatePropertiesForEntitySets = (entitySetsById, entityTypesById, propertyTypesById) => {
    let entitySetMap = Map();
    entitySetsById.valueSeq().forEach((entitySet) => {
      const entitySetId = entitySet.get('id');
      const dateFqns = entityTypesById
        .getIn([entitySet.get('entityTypeId'), 'properties'])
        .filter(propertyTypeId => DATE_DATATYPES.includes(propertyTypesById.getIn([propertyTypeId, 'datatype'])))
        .map(propertyTypeId => getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'])));

      entitySetMap = entitySetMap.set(entitySetId, dateFqns);
    });

    return entitySetMap;
  }

  getUpdatedNeighborsList = (orderedNeighbors, dateTypeOptions, entitySetId, entity, neighbor, entitySetMap) => {
    let updatedNeighbors = orderedNeighbors;

    const propertyTypeFQNs = entitySetMap.get(entitySetId, List());
    const entityKeyId = getEntityKeyId(entity);
    propertyTypeFQNs.forEach((propertyTypeFqn) => {
      entity.get(propertyTypeFqn, List()).forEach((dateStr) => {
        const date = moment(dateStr);
        if (date.isValid()) {
          const dateEntry :DateEntry = {
            entitySetId,
            entityKeyId,
            propertyTypeFqn,
            date,
            neighbor
          };

          updatedNeighbors = updatedNeighbors.push(dateEntry);
        }
      });
    });

    return updatedNeighbors;
  }

  preprocessProps = (props :Props) => {
    const {
      entitySetsById,
      entityTypesById,
      neighbors,
      propertyTypesById
    } = props;
    const entitySetMap = this.getDatePropertiesForEntitySets(entitySetsById, entityTypesById, propertyTypesById);

    let orderedNeighbors = List();
    let dateTypeOptions = Map();

    neighbors.forEach((neighbor) => {
      const associationEntitySetId = neighbor.getIn(['associationEntitySet', 'id']);
      const associationEntity = neighbor.get('associationDetails');
      orderedNeighbors = this.getUpdatedNeighborsList(
        orderedNeighbors,
        dateTypeOptions,
        associationEntitySetId,
        associationEntity,
        neighbor,
        entitySetMap
      );
      const neighborEntitySetId = neighbor.getIn(['neighborEntitySet', 'id']);
      const neighborEntity = neighbor.get('neighborDetails');
      if (neighborEntitySetId) {
        orderedNeighbors = this.getUpdatedNeighborsList(
          orderedNeighbors,
          dateTypeOptions,
          neighborEntitySetId,
          neighborEntity,
          neighbor,
          entitySetMap
        );

        const pair = List.of(associationEntitySetId, neighborEntitySetId);
        if (!dateTypeOptions.has(pair)) {
          const fqnOptions = entitySetMap.get(associationEntitySetId, List()).concat(
            entitySetMap.get(neighborEntitySetId, List())
          );
          dateTypeOptions = dateTypeOptions.set(pair, fqnOptions);
        }
      }

    });

    return {
      orderedNeighbors: orderedNeighbors.sort((n1, n2) => (n1.date.isBefore(n2.date) ? 1 : -1)),
      dateTypeOptions
    };
  }

  getEventName = (dateEntry) => {
    return dateEntry.neighbor.getIn(['neighborEntitySet', 'title']);
  }

  getFilteredNeighbors = () => {
    const {
      orderedNeighbors,
      startDate,
      endDate,
      selectedDateTypes
    } = this.state;

    const start = moment(startDate);
    const end = moment(endDate);
    const startIsBounded = startDate && start.isValid();
    const endIsBounded = endDate && end.isValid();

    return orderedNeighbors.filter((dateEntry) => {
      const { date, neighbor, propertyTypeFqn } = dateEntry;

      /* check if date property type is selected */
      const associationEntitySetId = neighbor.getIn(['associationEntitySet', 'id']);
      const neighborEntitySetId = neighbor.getIn(['neighborEntitySet', 'id']);
      if (associationEntitySetId && neighborEntitySetId) {
        const pair = List.of(associationEntitySetId, neighborEntitySetId);
        if (!selectedDateTypes.get(pair, List()).includes(propertyTypeFqn)) {
          return false;
        }
      }

      /* check if date filter matches */
      if (startIsBounded || endIsBounded) {
        if (startIsBounded && start.isAfter(date)) {
          return false;
        }
        if (endIsBounded && end.isBefore(date)) {
          return false;
        }
      }
      return true;
    });
  }

  renderOverview = (filteredNeighbors) => {

    return <HorizontalTimeline datesToRender={filteredNeighbors} />
  }

  renderTimeline = (filteredNeighbors) => {
    const { reverse } = this.state;
    const {
      entityTypesById,
      propertyTypesById
    } = this.props;

    let lastYear;

    const neighborList = reverse ? filteredNeighbors.reverse() : filteredNeighbors;
    const rows = neighborList.map((dateEntry :DateEntry, index :number) => {
      const { date, neighbor } = dateEntry;
      const year = date.format('YYYY');
      const day = date.format('MMMM D');

      const yearStr = year === lastYear ? '' : year;
      lastYear = year;
      return (
        <EventRow key={index}>
          <DateLabel>
            <div>{yearStr}</div>
            <div>{day}</div>
          </DateLabel>
          <TimelineRow neighbor={neighbor} entityTypesById={entityTypesById} propertyTypesById={propertyTypesById} />
        </EventRow>
      );
    });

    return (
      <ColumnWrapper>
        {rows}
      </ColumnWrapper>
    );
  }

  onDisplayPTChange = (e, pair, fqn) => {
    let { selectedDateTypes } = this.state;
    let selectedPTs = selectedDateTypes.get(pair, List());
    const { checked } = e.target;
    if (checked && !selectedPTs.includes(fqn)) {
      selectedPTs = selectedPTs.push(fqn);
    }
    else if (!checked && selectedPTs.includes(fqn)) {
      selectedPTs = selectedPTs.remove(selectedPTs.indexOf(fqn));
    }
    selectedDateTypes = selectedDateTypes.set(pair, selectedPTs);
    this.setState({ selectedDateTypes });
  }

  onDisplayESChange = (e, pair) => {
    const { dateTypeOptions } = this.state;
    let { selectedDateTypes } = this.state;
    const { checked } = e.target;

    if (checked) {
      selectedDateTypes = selectedDateTypes.set(pair, dateTypeOptions.get(pair, List()));
    }
    else {
      selectedDateTypes = selectedDateTypes.set(pair, List());
    }

    this.setState({ selectedDateTypes });
  }

  renderDisplayOptionGroup = ([pair, fqnList]) => {
    const { entitySetsById, propertyTypesByFqn } = this.props;
    const { selectedDateTypes } = this.state;


    const getTitle = id => entitySetsById.getIn([id, 'title'], '');

    const headerText = `${getTitle(pair.get(0))} ${getTitle(pair.get(1))}`;

    return (
      <DisplayOptionGroup key={headerText}>
        <DisplayOptionRow>
          <StyledCheckbox
              checked={!!selectedDateTypes.get(pair, List()).size}
              onChange={e => this.onDisplayESChange(e, pair)} />
          <span>{headerText}</span>
        </DisplayOptionRow>
        {fqnList.map((fqn) => {
          const ptTitle = propertyTypesByFqn.getIn([fqn, 'title'], '');
          return (
            <DisplayOptionRow key={`${headerText}|${fqn}`}>
              <StyledCheckbox
                  checked={selectedDateTypes.get(pair, List()).includes(fqn)}
                  onChange={e => this.onDisplayPTChange(e, pair, fqn)} />
              <span>{ptTitle}</span>
            </DisplayOptionRow>
          );
        })}
      </DisplayOptionGroup>
    )
  }

  renderDisplayOption = () => {
    const { dateTypeOptions } = this.state;

    return (
      <PaddedColumnWrapper>
        <TitleInputLabel>Select properties to display on the timeline.</TitleInputLabel>
        {
          dateTypeOptions
            .entrySeq()
            .filter(([pair, fqnList]) => !!fqnList.size)
            .map(this.renderDisplayOptionGroup)
        }
      </PaddedColumnWrapper>
    );
  }

  renderDateOption = () => {
    const { startDateInput, endDateInput } = this.state;

    return (
      <PaddedColumnWrapper>
        <TitleInputLabel>Set a date range to display on the timeline.</TitleInputLabel>
        <InputRow>
          <InputGroup>
            <InputLabel>Date Range Start</InputLabel>
            <DatePickerWrapper>
              <DatePicker
                  value={startDateInput}
                  dateFormat={DATE_FORMAT}
                  onChange={date => this.setState({ startDateInput: date })}
                  selectProps={{
                    placeholder: DATE_FORMAT,
                  }} />
            </DatePickerWrapper>
          </InputGroup>
          <InputGroup>
            <InputLabel>Date Range End</InputLabel>
            <DatePickerWrapper>
              <DatePicker
                  value={endDateInput}
                  dateFormat={DATE_FORMAT}
                  onChange={date => this.setState({ endDateInput: date })}
                  selectProps={{
                    placeholder: DATE_FORMAT,
                  }} />
            </DatePickerWrapper>
          </InputGroup>
          <InputGroup>
            <InputLabel />
            <FullWidthInfoButton
                onClick={() => this.setState({
                  startDate: startDateInput,
                  endDate: endDateInput
                })}>
              Set Date Range
            </FullWidthInfoButton>
          </InputGroup>
        </InputRow>
      </PaddedColumnWrapper>
    );
  }

  renderOptionsBar = () => {
    const { reverse } = this.state;
    return (
      <OptionsBar>
        <ButtonGroup>
          <DropdownButtonWrapper title="Display Option" width="960">{this.renderDisplayOption()}</DropdownButtonWrapper>
          <MarginLeftWrapper>
            <DropdownButtonWrapper title="Date Option" width="800">{this.renderDateOption()}</DropdownButtonWrapper>
          </MarginLeftWrapper>
        </ButtonGroup>
        <ButtonGroup>
          <SkinnyBasicButton onClick={() => this.setState({ reverse: !reverse })}>
            <FontAwesomeIcon icon={faLongArrowUp} />
            <FontAwesomeIcon icon={faLongArrowDown} />
          </SkinnyBasicButton>
        </ButtonGroup>
      </OptionsBar>
    );
  }

  render() {
    const filteredNeighbors = this.getFilteredNeighbors();

    return (
      <Wrapper>
        {this.renderOptionsBar()}
        <h1>Overview</h1>
        {this.renderOverview(filteredNeighbors)}
        <h1>Timeline</h1>
        {this.renderTimeline(filteredNeighbors)}
      </Wrapper>
    );
  }
}
