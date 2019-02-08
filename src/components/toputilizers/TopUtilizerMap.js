/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import {
  List,
  Map,
  OrderedSet,
  fromJS
} from 'immutable';

import SimpleMap from '../map/SimpleMap';
import ResourceDropdownFilter from './resources/ResourceDropdownFilter';
import { getEntityTitle } from '../../utils/TagUtils';
import { CenteredColumnContainer, FixedWidthWrapper, TitleText } from '../layout/Layout';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';

type Props = {
  results :List<*>,
  neighborsById :Map<*, *>,
  locationsById :Map<*, *>,
  entityTypesById :Map<*, *>,
  propertyTypesById :Map<*, *>,
  selectedEntitySet :Map<*, *>,
  neighborTypes :List<*>
}

type State = {
  neighborOptions :List<*>,
}

const FilterWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 30px;
`;

const PaddedTitleText = styled(TitleText)`
  justify-self: flex-start;
  font-size: 16px;
`;

const MapWrapper = styled(FixedWidthWrapper)`
  height: 600px;
  position: relative;
`;

const FILTERS = {
  SELECTED_UTILIZER: 'SELECTED_UTILIZER',
  SELECTED_TYPE: 'SELECTED_TYPE'
};

const BLANK_OPTION = fromJS({
  value: '',
  label: 'All'
});

export default class TopUtilizerMap extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const locationId = props.propertyTypesById.entrySeq().filter(([id, propertyType]) => getFqnString(
      propertyType.get('type', Map())
    ) === PROPERTY_TYPES.LOCATION).map(([id]) => id).get(0);

    const neighborOptions = this.getNeighborOptions(locationId, props);

    this.state = {
      locationId,
      neighborOptions,
      [FILTERS.SELECTED_TYPE]: neighborOptions.get(0),
      [FILTERS.SELECTED_UTILIZER]: BLANK_OPTION.toJS()
    };
  }

  componentWillReceiveProps(nextProps) {
    const { locationId } = this.state;
    const { selectedEntitySet, neighborsById } = this.props;
    if (selectedEntitySet !== nextProps.selectedEntitySet || neighborsById !== nextProps.neighborsById) {
      const neighborOptions = this.getNeighborOptions(locationId, nextProps);
      this.setState({
        neighborOptions,
        [FILTERS.SELECTED_TYPE]: neighborOptions.get(0)
      });
    }
  }

  hasLocations = (locationId, entityTypeId, entityTypesById) => entityTypesById
    .getIn([entityTypeId, 'properties'], List()).includes(locationId)

  getNeighborOptions = (locationId, props) => {
    const { neighborTypes, selectedEntitySet, entityTypesById } = props;

    const neighborTypeList = this.hasLocations(locationId, selectedEntitySet.get('entityTypeId'), entityTypesById)
      ? List.of({
        value: selectedEntitySet.get('id'),
        label: selectedEntitySet.get('title')
      }) : List();

    return neighborTypeList.concat(neighborTypes
      .filter(type => type.getIn(['neighborEntityType', 'properties']).includes(locationId))
      .map(type => ({
        value: type.getIn(['neighborEntityType', 'id']),
        label: type.getIn(['neighborEntityType', 'title'])
      })));
  }

  renderSelectDropdown = (key, label, options) => {
    const onChange = (newValue) => {
      this.setState({ [key]: newValue });
    };
    return (
      <ResourceDropdownFilter
          value={this.state[key]}
          label={label}
          options={options}
          onChange={onChange}
          withMargin />
    );
  }

  getLocations = () => {
    const selectedItem = this.state[FILTERS.SELECTED_TYPE].value;
    const selectedUtilizer = this.state[FILTERS.SELECTED_UTILIZER].value;
    const {
      results,
      neighborsById,
      selectedEntitySet,
      locationsById
    } = this.props;

    let locations = Map();

    const utilizerList = selectedUtilizer
      ? results.filter(result => getEntityKeyId(result) === selectedUtilizer)
      : results;

    utilizerList.forEach((result) => {
      const entityKeyId = getEntityKeyId(result);

      if ((selectedItem === selectedEntitySet.get('id')) && locationsById.get(entityKeyId, List()).size) {
        locations = locations.set(entityKeyId, locationsById.get(entityKeyId, List()));
      }
      else {
        const coords = neighborsById
          .get(entityKeyId, List())
          .filter(neighborObj => selectedItem === neighborObj.getIn(['neighborEntitySet', 'entityTypeId']))
          .flatMap(neighborObj => locationsById.get(getEntityKeyId(neighborObj.get('neighborDetails', Map())), List()));

        if (coords && coords.size) {
          locations = locations.set(entityKeyId, coords);
        }
      }

    });

    return locations;
  }

  render() {
    const {
      results,
      selectedEntitySet,
      entityTypesById,
      propertyTypesById
    } = this.props;
    const { neighborOptions } = this.state;

    const selectedEntityType = entityTypesById.get(selectedEntitySet.get('entityTypeId'));

    const utilizerOptions = [
      BLANK_OPTION.toJS(),
      ...results.map((utilizer, index) => {
        const value = getEntityKeyId(utilizer);
        const num = index + 1;
        const label = getEntityTitle(selectedEntityType, propertyTypesById, utilizer);
        return { value, num, label };
      }).toJS()
    ];

    return (
      <CenteredColumnContainer>
        <FixedWidthWrapper>
          <PaddedTitleText>Filter by event types and utilizers</PaddedTitleText>
          <FilterWrapper>
            {this.renderSelectDropdown(FILTERS.SELECTED_UTILIZER, selectedEntityType.get('title'), utilizerOptions)}
            {this.renderSelectDropdown(FILTERS.SELECTED_TYPE, 'Event Type', neighborOptions)}
          </FilterWrapper>
          <MapWrapper>
            <SimpleMap
                coordinatesByEntity={this.getLocations()}
                selectedEntityKeyIds={OrderedSet()}
                selectEntity={() => {}} />
          </MapWrapper>
        </FixedWidthWrapper>
      </CenteredColumnContainer>
    );
  }
}
