import styled, { css } from 'styled-components';

export const FixedWidthWrapper = styled.div`
  width: ${(props) => props.width || '960px'};
`;

export const HeaderComponentWrapper = styled.div`
  width: 100%;
  background-color: #ffffff;
`;

export const ComponentWrapper = styled.div`
  padding: 30px 155px;
`;

export const Title = styled.div`
  font-size: 18px;
  margin: 30px 0;
`;

export const TableWrapper = styled.div`
  border-radius: 5px;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;
  padding: 5px;
`;

export const CenteredColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const TitleText = styled.div`
  font-family: 'Open Sans';
  font-size: 20px;
  font-weight: 600;
  color: #2e2e34;
`;

export const LoadingText = styled(TitleText)`
  margin: 20px;
  color: #555e6f;
  font-weight: 400;
`;

export const RadioTitle = styled.div`
  width: fit-content;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #555e6f;
  margin-bottom: 10px;

  &:not(:first-child) {
    width: 100%;
    margin-top: 20px;
    border-top: 1px solid #e6e6eb;
    padding-top: 20px;
  }
`;

export const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: ${(props) => (props.noPadding ? 0 : '20px')};
`;

export const DropdownRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  ${(props) => (props.radioHalfSize ? css`
    label {
      width: 49%;
      text-align: left;
    }
  ` : '')}
`;

export const DropdownTab = styled.div`
  padding-bottom: 20px;
  margin-bottom: -20px;
  margin-right: 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.selected ? '#555e6f' : '#8e929b')};
  border-bottom: 1px solid ${(props) => (props.selected ? '#555e6f' : 'transparent')};

  &:hover {
    cursor: pointer;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6eb;
`;

export const PropertyTypeCheckboxWrapper = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: ${(props) => (props.twoCols ? '48% 48%' : '32% 32% 32%')};
  grid-auto-rows: 25px;
  grid-column-gap: 10px;
  grid-row-gap: ${(props) => (props.twoCols ? 30 : 20)}px;
  grid-auto-flow: row;
  align-items: center;
`;

export const InputLabel = styled.span`
  color: #8e929b;
  margin-bottom: 10px;
  font-size: 14px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  width: ${(props) => (props.fullSize ? '100%' : '19%')};
`;
