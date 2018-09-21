/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';

import PersonResultCard from '../people/PersonResultCard';
import ButtonToolbar from '../buttons/ButtonToolbar';
import InfoButton from '../buttons/InfoButton';
import DataTable from '../data/DataTable';
import EntityDetails from '../../containers/data/EntityDetails';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { IMAGE_PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { CenteredColumnContainer, FixedWidthWrapper, TableWrapper } from '../layout/Layout';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';

type Props = {
  results :List<*>,
  countBreakdown :Map<*, *>,
  entityTypesById :Map<*, *>,
  propertyTypesById :Map<*, *>,
  isPersonType :boolean,
  entitySetId :string,
  propertyTypes :List<*>,
  selectedPropertyTypes :Set<string>,
  exploring :boolean,
  onSelectEntity :({ entitySetId :string, entity :Map<*, *>}) => void
}

type State = {
  layout :string,
  showCountDetails :boolean
}


const ToolbarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SmallInfoButton = styled(InfoButton)`
  font-size: 12px;
`;

const LAYOUTS = {
  PERSON: 'PERSON',
  TABLE: 'TABLE'
};

export default class TopUtilizerSearchResults extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      layout: props.isPersonType ? LAYOUTS.PERSON : LAYOUTS.TABLE,
      showCountDetails: false
    };
  }

  updateLayout = layout => this.setState({ layout });

  onSelect = (index, entity) => {
    const { entitySetId, onSelectEntity } = this.props;
    onSelectEntity({ entitySetId, entity });
  };

  getCountsForUtilizer = (entityKeyId) => {
    const { countBreakdown, entityTypesById, propertyTypesById } = this.props;

    const getEntityTypeTitle = id => entityTypesById.getIn([id, 'title'], '');

    return countBreakdown.get(entityKeyId, Map()).entrySeq()
      .filter(([pair]) => pair !== 'score')
      .flatMap(([pair, pairMap]) => {
        const pairTitle = `${getEntityTypeTitle(pair.get(0))} ${getEntityTypeTitle(pair.get(1))}`;
        return pairMap.entrySeq().map(([key, count]) => {
          const title = key === COUNT_FQN
            ? pairTitle
            : `${pairTitle} -- ${propertyTypesById.getIn([key, 'title'], '')}`;
          return Map().set(TOP_UTILIZERS_FILTER.LABEL, title).set(COUNT_FQN, count);
        });
      });
  }

  renderPersonResults = () => {
    const { results } = this.props;
    const { showCountDetails } = this.state;

    return results.map((person, index) => (
      <PersonResultCard
          key={getEntityKeyId(person)}
          counts={showCountDetails ? this.getCountsForUtilizer(getEntityKeyId(person)) : null}
          index={index + 1}
          person={person}
          onClick={() => this.onSelect(index, person)} />
    ));
  }

  renderTableResults = () => {
    const { propertyTypes, results, selectedPropertyTypes } = this.props;
    let propertyTypeHeaders = List();
    propertyTypeHeaders = propertyTypeHeaders.push(fromJS({
      id: COUNT_FQN,
      value: 'Score'
    }));

    propertyTypes.forEach((propertyType) => {
      const id = getFqnString(propertyType.get('type'));
      const value = propertyType.get('title');
      if (selectedPropertyTypes.has(propertyType.get('id'))) {
        const isImg = IMAGE_PROPERTY_TYPES.includes(id);
        propertyTypeHeaders = propertyTypeHeaders.push(fromJS({ id, value, isImg }));
      }
    });

    return (
      <TableWrapper>
        <DataTable headers={propertyTypeHeaders} data={results} onRowClick={this.onSelect} />
      </TableWrapper>
    );
  };

  renderLayoutToolbar = () => {
    const { layout, showCountDetails } = this.state;
    const options = [
      {
        label: 'List',
        value: LAYOUTS.PERSON,
        onClick: () => this.updateLayout(LAYOUTS.PERSON)
      },
      {
        label: 'Table',
        value: LAYOUTS.TABLE,
        onClick: () => this.updateLayout(LAYOUTS.TABLE)
      }
    ];
    return (
      <ToolbarWrapper>
        <ButtonToolbar options={options} value={layout} noPadding />
        { layout === LAYOUTS.PERSON ? (
          <SmallInfoButton onClick={() => this.setState({ showCountDetails: !showCountDetails })}>
            {`${showCountDetails ? 'Hide' : 'Show'} Score Details`}
          </SmallInfoButton>
        ) : null}
      </ToolbarWrapper>
    );
  }

  renderTopUtilizerSearchResults = () => {
    const { isPersonType } = this.props;
    const { layout } = this.state;

    return (isPersonType && layout === LAYOUTS.PERSON) ? this.renderPersonResults() : this.renderTableResults();
  }

  render() {
    const { exploring, isPersonType, results } = this.props;

    let rankingsById = Map();
    results.forEach((utilizer, index) => {
      rankingsById = rankingsById.set(getEntityKeyId(utilizer), index + 1);
    })

    const resultContent = exploring
      ? <EntityDetails rankingsById={rankingsById} />
      : this.renderTopUtilizerSearchResults();

    return (
      <CenteredColumnContainer>
        <FixedWidthWrapper>
          {(isPersonType && !exploring) ? this.renderLayoutToolbar() : null}
          {resultContent}
        </FixedWidthWrapper>
      </CenteredColumnContainer>
    );
  }
}
