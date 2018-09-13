/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';

import PersonResultCard from '../people/PersonResultCard';
import ButtonToolbar from '../buttons/ButtonToolbar';
import DataTable from '../data/DataTable';
import EntityDetails from '../../containers/data/EntityDetails';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { FixedWidthWrapper, TableWrapper } from '../layout/Layout';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';

type Props = {
  results :List<*>,
  isPersonType :boolean,
  entitySetId :string,
  propertyTypes :List<*>,
  selectedPropertyTypes :Set<string>,
  exploring :boolean,
  onSelectEntity :({ entitySetId :string, entity :Map<*, *>}) => void,
  onUnmount :() => void
}

type State = {
  layout :string
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LeftJustifyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const LAYOUTS = {
  PERSON: 'PERSON',
  TABLE: 'TABLE'
};

export default class TopUtilizerSearchResults extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      layout: props.isPersonType ? LAYOUTS.PERSON : LAYOUTS.TABLE
    };
  }

  updateLayout = layout => this.setState({ layout });

  onSelect = (index, entity) => {
    const { entitySetId, onSelectEntity } = this.props;
    onSelectEntity({ entitySetId, entity });
  };

  renderPersonResults = () => {
    const { results } = this.props;

    return results.map((person, index) => (
      <PersonResultCard
          key={getEntityKeyId(person)}
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
      value: 'Count'
    }));

    propertyTypes.forEach((propertyType) => {
      const id = getFqnString(propertyType.get('type'));
      const value = propertyType.get('title');
      if (selectedPropertyTypes.has(propertyType.get('id'))) {
        propertyTypeHeaders = propertyTypeHeaders.push(fromJS({ id, value }));
      }
    });

    return (
      <TableWrapper>
        <DataTable headers={propertyTypeHeaders} data={results} onRowClick={this.onSelect} />
      </TableWrapper>
    );
  };

  renderLayoutToolbar = () => {
    const { layout } = this.state;
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
      <LeftJustifyWrapper>
        <ButtonToolbar options={options} value={layout} />
      </LeftJustifyWrapper>
    );
  }

  renderTopUtilizerSearchResults = () => {
    const { isPersonType } = this.props;
    const { layout } = this.state;

    return (isPersonType && layout === LAYOUTS.PERSON) ? this.renderPersonResults() : this.renderTableResults();
  }

  renderEntityDetails = () => {
    const { isPersonType } = this.props;

    return <EntityDetails isPersonType={isPersonType} withCounts />;
  }

  render() {
    const { exploring, isPersonType } = this.props;

    const resultContent = exploring ? this.renderEntityDetails() : this.renderTopUtilizerSearchResults();

    return (
      <ResultsContainer>
        <FixedWidthWrapper>
          {(isPersonType && !exploring) ? this.renderLayoutToolbar() : null}
          {resultContent}
        </FixedWidthWrapper>
      </ResultsContainer>
    );
  }
}
