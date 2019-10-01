/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';

import DataTable from './DataTable';
import Banner from '../cards/Banner';
import { IMAGE_PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { TableWrapper } from '../layout/Layout';

const { FullyQualifiedName } = Models;

const AssociationGroupWrapper = styled.div`
  width: 100%;
  padding: 20px 0;
  border-top: 1px solid #e1e1eb;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => (props.justifyLeft ? 'flex-start' : 'space-between')};
  align-items: center;
`;

const HeaderGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const AssociationTitle = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #2e2e34;
  margin-right: 10px;
`;

const NeighborTitle = styled(AssociationTitle)`
  padding: 20px 0 20px 30px;
`;

const HideButton = styled.button`
  border: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #8e929b;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  background-color: transparent;

  &:hover {
    cursor: pointer;
    color: #555e6f;
  }

  &:focus {
    outline: none;
  }
`;

const SpacedTableWrapper = styled(TableWrapper)`
  margin: 10px 0;
`;

const DownIcon = styled(FontAwesomeIcon).attrs({
  icon: faChevronDown
})`
  margin-left: 5px;
`;

const UpIcon = styled(FontAwesomeIcon).attrs({
  icon: faChevronUp
})`
  margin-left: 5px;
`;

type Props = {
  entityTypes :List;
  entityTypesIndexMap :Map;
  neighborsById :Map<string, Map<*, *>>;
  onSelectEntity :({ entitySetId :string, entity :Map<*, *> }) => void;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
}

type State = {
  hidden :boolean;
};

export default class AssociationGroup extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      hidden: false
    };
  }

  getAssociationTitle = () => {
    const { neighborsById } = this.props;
    return neighborsById.valueSeq().getIn([0, 0, 'associationEntitySet', 'title'], '');
  }

  getPropertyHeaders = (entityTypeId :UUID) => {

    const {
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeId);
    const entityType :Map = entityTypes.get(entityTypeIndex, Map());

    return entityType.get('properties', List()).map((propertyTypeId :UUID) => {
      const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
      const propertyType = propertyTypes.get(propertyTypeIndex, Map());
      const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
      const isImg = IMAGE_PROPERTY_TYPES.includes(propertyTypeFQN);
      const value = propertyType.get('title', '');
      return fromJS({ id: propertyTypeFQN, value, isImg });
    });
  }

  getOnRowClick = (entitySetId :UUID) => {
    const { onSelectEntity } = this.props;
    return (index :number, entity :Map) => {
      onSelectEntity({ entitySetId, entity });
    };
  }

  renderNeighborTable = (neighborEntitySetId :UUID, neighbors :List) => {
    const firstNeighbor = neighbors.get(0, Map());
    const neighborTitle = firstNeighbor.getIn(['neighborEntitySet', 'title'], '');

    const associationTypeId = firstNeighbor.getIn(['associationEntitySet', 'entityTypeId']);
    const neighborTypeId = firstNeighbor.getIn(['neighborEntitySet', 'entityTypeId']);
    const headers = this.getPropertyHeaders(associationTypeId).concat(this.getPropertyHeaders(neighborTypeId));

    const data = neighbors.map((neighbor) => {
      const associationDetails = neighbor.get('associationDetails', Map());
      const neighborDetails = neighbor.get('neighborDetails', Map());
      return associationDetails.merge(neighborDetails);
    });

    return (
      <SpacedTableWrapper key={neighborEntitySetId}>
        <Row justifyLeft>
          <NeighborTitle>{neighborTitle}</NeighborTitle>
          <Banner>{neighbors.size}</Banner>
        </Row>
        <DataTable data={data} headers={headers} onRowClick={this.getOnRowClick(neighborEntitySetId)} />
      </SpacedTableWrapper>
    );
  }

  render() {
    const { neighborsById } = this.props;
    const { hidden } = this.state;

    return (
      <AssociationGroupWrapper>
        <Row>
          <HeaderGroup>
            <AssociationTitle>{this.getAssociationTitle()}</AssociationTitle>
            <Banner secondary>{neighborsById.size}</Banner>
          </HeaderGroup>
          <HideButton onClick={() => this.setState({ hidden: !hidden })}>
            {hidden ? 'Show' : 'Hide'}
            {hidden ? <DownIcon /> : <UpIcon />}
          </HideButton>
        </Row>
        {
          hidden
            ? null
            : neighborsById.entrySeq().map(([neighborEntitySetId, neighbors]) => this.renderNeighborTable(
              neighborEntitySetId,
              neighbors
            ))
        }
      </AssociationGroupWrapper>
    );
  }

}
