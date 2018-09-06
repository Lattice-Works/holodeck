/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';

import PersonResultCard from '../people/PersonResultCard';
import ButtonToolbar from '../buttons/ButtonToolbar';
import BackNavButton from '../buttons/BackNavButton';
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
  onSelectEntity :({ entitySetId :string, entity :Map<*, *>}) => void,
  onUnmount :() => void
}

type State = {
  layout :string,
  exploring :boolean
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

export default class TopUtilizerResults extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      layout: props.isPersonType ? LAYOUTS.PERSON : LAYOUTS.TABLE,
      exploring: false
    };
  }

  componentWillUnmount() {
    const { onUnmount } = this.props;
    onUnmount();
  }

  updateLayout = layout => this.setState({ layout });

  onSelect = (index, entity) => {
    const { entitySetId, onSelectEntity } = this.props;
    onSelectEntity({ entitySetId, entity });
    this.setState({ exploring: true });
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
    const { propertyTypes, results } = this.props;
    let propertyTypeHeaders = List();
    propertyTypeHeaders = propertyTypeHeaders.push(fromJS({
      id: COUNT_FQN,
      value: 'Count'
    }));

    propertyTypes.forEach((propertyType) => {
      const id = getFqnString(propertyType.get('type'));
      const value = propertyType.get('title');
      propertyTypeHeaders = propertyTypeHeaders.push(fromJS({ id, value }));
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

  renderTopUtilizerResults = () => {
    const { isPersonType } = this.props;
    const { layout } = this.state;

    return (isPersonType && layout === LAYOUTS.PERSON) ? this.renderPersonResults() : this.renderTableResults();
  }

  renderEntityDetails = () => {
    const { isPersonType } = this.props;

    return <EntityDetails isPersonType={isPersonType} withCounts />;
  }

  render() {
    const { isPersonType } = this.props;
    const { exploring } = this.state;

    const resultContent = exploring ? this.renderEntityDetails() : this.renderTopUtilizerResults();

    return (
      <ResultsContainer>
        <FixedWidthWrapper>
          {exploring
            ? <BackNavButton onClick={() => this.setState({ exploring: false })}>Back to Search Results</BackNavButton>
            : null}
          {(isPersonType && !exploring) ? this.renderLayoutToolbar() : null}
          {resultContent}
        </FixedWidthWrapper>
      </ResultsContainer>
    );
  }
}
