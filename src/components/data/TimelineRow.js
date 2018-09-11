/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

import DataTable from './DataTable';
import { getFqnString } from '../../utils/DataUtils';

type Props = {
  neighbor :Map<*, *>,
  propertyTypeTitle :string,
  colors :{
    PRIMARY :string,
    SECONDARY :string
  },
  entityTypesById :Map<*, *>,
  propertyTypesById :Map<*, *>,
  onClick :() => void
};

type State = {
  open :boolean
}

const ROW_WIDTH = 730;

const TimelineRowWrapper = styled.div`
  width: ${ROW_WIDTH}px;
`;

const Row = styled.div.attrs({
  style: ({ colors }) => ({
    backgroundColor: colors.SECONDARY,
    color: colors.PRIMARY
  })
})`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
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
  border: 1px solid #e1e1eb;
  border-radius: 5px;
  margin-top: 5px;
  padding 5px;
`;

const TableTitle = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #2e2e34;
  padding: 20px 0 10px 20px;
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
    );
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
    const { neighbor, propertyTypeTitle, onClick } = this.props;

    const associationTypeId = neighbor.getIn(['associationEntitySet', 'entityTypeId']);
    const neighborTypeId = neighbor.getIn(['neighborEntitySet', 'entityTypeId']);
    const headers = this.getPropertyHeaders(associationTypeId).concat(this.getPropertyHeaders(neighborTypeId));

    const data = List.of(neighbor.get('associationDetails', Map()).merge(neighbor.get('neighborDetails', Map())));

    const aesTitle = neighbor.getIn(['associationEntitySet', 'title'], '');
    const nesTitle = neighbor.getIn(['neighborEntitySet', 'title'], '');
    const baseTitle = neighbor.get('src') ? `${aesTitle} ${nesTitle}` : `${nesTitle} ${aesTitle}`;

    return (
      <TableWrapper>
        <TableTitle>{`${baseTitle}: ${propertyTypeTitle}`}</TableTitle>
        <DataTable data={data} headers={headers} width={ROW_WIDTH} onRowClick={onClick} />
      </TableWrapper>
    );
  }

  render() {
    const { colors } = this.props;
    const { open } = this.state;

    return (
      <TimelineRowWrapper>
        <Row colors={colors}>
          {this.getEventName()}
          {this.renderExpandButton()}
        </Row>
        {open ? this.renderDataTable() : null}
      </TimelineRowWrapper>
    );
  }
}
