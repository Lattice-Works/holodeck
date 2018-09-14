import styled from 'styled-components';

export const FixedWidthWrapper = styled.div`
  width: ${props => props.width || '960px'};
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
