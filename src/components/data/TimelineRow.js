/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

import DataTable from './DataTable';
import { BLUE } from '../../utils/constants/Colors';
import { getFqnString } from '../../utils/DataUtils';

type Props = {
  neighbor :Map<*, *>,
  entityTypesById :Map<*, *>,
  propertyTypesById :Map<*, *>
};

type State = {
  open :boolean
}

const ROW_WIDTH = 730;

const TimelineRowWrapper = styled.div`
  width: ${ROW_WIDTH}px;
  margin-left: 45px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${BLUE.BLUE_1};
  color: ${BLUE.BLUE_2};
  padding: 15px 20px;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  border-radius: 5px;
  width: 100%;
`;

const ExpandButton = styled.button`
  width: 31px;
  height: 31px;
  border-radius: 3px;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }
`;

const TableWrapper = styled.div`
  background-color: #ffffff;
`;

export default class TimelineRow extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  getEventName = () => {
    const { neighbor } = this.props;
    return neighbor.getIn(['neighborEntitySet', 'title']);
  }

  renderExpandButton = () => {
    const { open } = this.state;
    return (
      <ExpandButton onClick={() => this.setState({ open: !open })}>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
      </ExpandButton>
    )
  }

  getPropertyHeaders = (entityTypeId) => {
    const { entityTypesById, propertyTypesById } = this.props;
    return entityTypesById.getIn([entityTypeId, 'properties'], List()).map((propertyTypeId) => {
      const propertyType = propertyTypesById.get(propertyTypeId, Map());
      const id = getFqnString(propertyType.get('type', Map()));
      const value = propertyType.get('title', '');
      return fromJS({ id, value });
    });
  }

  renderDataTable = () => {
    const { neighbor } = this.props;

    const associationTypeId = neighbor.getIn(['associationEntitySet', 'entityTypeId']);
    const neighborTypeId = neighbor.getIn(['neighborEntitySet', 'entityTypeId']);
    const headers = this.getPropertyHeaders(associationTypeId).concat(this.getPropertyHeaders(neighborTypeId));

    const data = List.of(neighbor.get('associationDetails', Map()).merge(neighbor.get('neighborDetails', Map())));

    return (
      <TableWrapper>
        <DataTable data={data} headers={headers} width={ROW_WIDTH} onRowClick={() => {}} />
      </TableWrapper>
    );
  }

  render() {
    const { open } = this.state;

    return (
      <TimelineRowWrapper>
        <Row>
          {this.getEventName()}
          {this.renderExpandButton()}
        </Row>
        {open ? this.renderDataTable() : null}
      </TimelineRowWrapper>
    );
  }
}
