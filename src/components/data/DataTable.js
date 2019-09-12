/*
 * @flow
 */

import * as React from 'react';

import Immutable, {
  List,
  Map,
  OrderedMap,
  Set,
} from 'immutable';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/pro-solid-svg-icons';
import { Grid, ScrollSync } from 'react-virtualized';

/*
 * constants
 */

const TABLE_MAX_HEIGHT = 600;
const TABLE_MAX_WIDTH = 980;

const COLUMN_MAX_WIDTH = 400;
const COLUMN_MIN_WIDTH = 100;

// TODO: what about ROW_MAX_HEIGHT?
const ROW_MIN_HEIGHT = 50;

const BORDER_COLOR = '#eeeeee';
const HEAD_BG_COLOR = '#f8f9fa';
const HEAD_COLOR = '#334455';
const CELL_HOV_COLOR = '#f8f8f8';

/*
 * styled components
 */

const TableContainer = styled.div`
  border: 1px solid ${BORDER_COLOR};
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  overflow: hidden;
  font-size: 14px;
  font-family: 'Open Sans', sans-serif;
`;

const TableHeadContainer = styled.div`
  background-color: ${HEAD_BG_COLOR};
  border-bottom: 1px solid ${BORDER_COLOR};
  color: ${HEAD_COLOR};
  display: flex;
  font-weight: 600;
  height: ${ROW_MIN_HEIGHT}px;
  width: ${(props) => props.width}px;
`;

const TableBodyContainer = styled.div`
  color: #424242;
  display: flex;
  height: ${(props :Object) => {
    const height = props.gridHeight ? props.gridHeight : TABLE_MAX_HEIGHT;
    // -1 to compensate for the border-bottom of each cell
    return `${height - 1}px`;
  }};
  width: ${(props) => props.width}px;
`;

const TableHeadGrid = styled(Grid)`
  outline: none;
  overflow: hidden !important;
`;

const TableBodyGrid = styled(Grid)`
  cursor: pointer;
  outline: none;
`;

const TableHeadCell = styled.div`
  align-items: center;
  display: flex;
  padding: 10px;
  ${(props :Object) => {
    if (props.setMaxWidth) {
      return css`
        max-width: ${COLUMN_MAX_WIDTH}px;
      `;
    }
    return '';
  }}
  &:hover {
    cursor: pointer;
  }
`;

const TableBodyCell = styled.div`
  align-items: center;
  border-bottom: 1px solid ${BORDER_COLOR};
  display: flex;
  overflow-y: scroll !important;
  padding: 10px;
  ${(props :Object) => {
    if (props.setMaxWidth) {
      return css`
        max-width: ${COLUMN_MAX_WIDTH}px;
      `;
    }
    return '';
  }}
  ${(props :Object) => {
    if (props.highlight) {
      return css`
        background-color: ${CELL_HOV_COLOR};
      `;
    }
    return '';
  }}
`;

const SortIcon = styled.span`
  ize: 11px;
`;

const HeaderText = styled.span`
  margin-left: 5px;
`;

const TableImg = styled.img.attrs({
  alt: ''
})`
  max-height: 40px;
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }
`;

const noop = () => {};

type SetMultiMap = Map<string, Set<any>>;
type ListSetMultiMap = List<SetMultiMap>;

type Props = {
  data :ListSetMultiMap;
  excludeEmptyColumns :boolean;
  headers :List<Map<string, string>>;
  onRowClick :Function;
  width :number;
};

type State = {
  data :ListSetMultiMap;
  headerIdToWidthMap :Map<string, number>;
  hoveredColumnIndex :number;
  hoveredRowIndex :number;
  lastColumnOverrideMaxWidth :boolean;
  sortOrder :number; // 0 = original, 1 = asc, 2 = desc
  sortedColumnIndex :number;
};

// TODO: should the 'data' prop be ListSetMultiMap, or is that too specific to search results data?
// TODO: allow table dimensions to be configurable
// TODO: compute estimated row heights similar to how column widths are computed
// TODO: really long header names without character breaks are overflowing: HELLO_WORLD_HELLO_WORLD_HELLO_WORLD
class DataTable extends React.Component<Props, State> {

  static defaultProps = {
    excludeEmptyColumns: true,
    onRowClick: () => {},
    width: TABLE_MAX_WIDTH
  };

  tableHeadGrid :?Grid;
  tableBodyGrid :?Grid;

  constructor(props :Props) {
    super(props);

    const { width } = props;

    let headerIdToWidthMap :Map<string, number> = this.getHeaderIdToWidthMap(props.headers, props.data);

    const tableWidth :number = headerIdToWidthMap.reduce(
      (widthSum :number, columnWidth :number) :number => widthSum + columnWidth,
      0
    );

    const lastColumnOverrideMaxWidth :boolean = (tableWidth < width);

    if (lastColumnOverrideMaxWidth) {
      const lastHeader :string = headerIdToWidthMap.keySeq().last();
      const lastColumnWidth :number = headerIdToWidthMap.get(lastHeader);
      const differenceInWidth :number = width - tableWidth;
      headerIdToWidthMap = headerIdToWidthMap.set(lastHeader, lastColumnWidth + differenceInWidth);
    }

    this.state = {
      headerIdToWidthMap,
      lastColumnOverrideMaxWidth,
      data: props.data,
      hoveredColumnIndex: -1,
      hoveredRowIndex: -1,
      sortedColumnIndex: -1,
      sortOrder: 0
    };
  }

  componentWillReceiveProps(nextProps :Object) {

    // if either the data changed or the headers changed, we need to setState() again
    if (!this.props.data.equals(nextProps.data) || !this.props.headers.equals(nextProps.headers)) {

      let headerIdToWidthMap :Map<string, number> = this.getHeaderIdToWidthMap(nextProps.headers, nextProps.data);

      const tableWidth :number = headerIdToWidthMap.reduce(
        (widthSum :number, columnWidth :number) :number => widthSum + columnWidth,
        0
      );

      const lastColumnOverrideMaxWidth :boolean = (tableWidth < nextProps.width);
      if (lastColumnOverrideMaxWidth) {
        const lastHeader :string = headerIdToWidthMap.keySeq().last();
        const lastColumnWidth :number = headerIdToWidthMap.get(lastHeader);
        const differenceInWidth :number = nextProps.width - tableWidth;
        headerIdToWidthMap = headerIdToWidthMap.set(lastHeader, lastColumnWidth + differenceInWidth);
      }

      this.setState({
        headerIdToWidthMap,
        lastColumnOverrideMaxWidth,
        data: nextProps.data,
        hoveredColumnIndex: -1,
        hoveredRowIndex: -1,
        sortedColumnIndex: -1,
        sortOrder: 0
      });
    }
  }

  componentWillUpdate(nextProps :Object, nextState :Object) {

    const headers :boolean = !this.props.headers.equals(nextProps.headers);

    const data :boolean = !this.state.data.equals(nextState.data);
    const headerIdToWidthMap :boolean = !this.state.headerIdToWidthMap.equals(nextState.headerIdToWidthMap);

    if (!headers || !data || !headerIdToWidthMap) {
      // https://github.com/bvaughn/react-virtualized/issues/136#issuecomment-190440226
      if (this.tableHeadGrid) {
        this.tableHeadGrid.recomputeGridSize();
      }
      if (this.tableBodyGrid) {
        this.tableBodyGrid.recomputeGridSize();
      }
    }
  }

  getHeaderIdToWidthMap = (headers :List<Map<string, string>>, data :ListSetMultiMap) :Map<string, number> => {

    return OrderedMap().withMutations((map :OrderedMap<string, number>) => {

      // iterate through the results, column by column, and compute an estimated width for each column
      headers.forEach((header :Map<string, string>) => {

        // find the widest cell in the column
        let columnWidth :number = 0;
        let isColumnEmpty :boolean = true;

        data.forEach((row :SetMultiMap) => {
          const cell :Set<any> = row.get(header.get('id'));
          if (cell) {
            let cellValue :string = cell;
            if (Immutable.isIndexed(cell)) {
              cellValue = cell.join(' ; ');
            }
            if (cellValue) {
              isColumnEmpty = false;
              const cellWidth = `${cellValue}`.length;
              if (cellWidth > columnWidth) {
                columnWidth = cellWidth;
              }
            }
          }
        });

        // compare the header cell width with the widest cell in the table
        const headerCellWidth :number = `${header.get('value')}`.length;
        const newColumnWidth :number = (headerCellWidth > columnWidth) ? headerCellWidth : columnWidth;

        // assume 12px per character. not the best approach, but an ok aproximation for now.
        let columnWidthInPixels :number = newColumnWidth * 12;

        // ensure column will have a minimum width
        if (columnWidthInPixels < COLUMN_MIN_WIDTH) {
          columnWidthInPixels = COLUMN_MIN_WIDTH;
        }
        // ensure column will have a maximum width
        else if (columnWidthInPixels > COLUMN_MAX_WIDTH) {
          columnWidthInPixels = COLUMN_MAX_WIDTH;
        }

        // store the computed column width. empty columns will not be rendered
        if (isColumnEmpty) {
          columnWidthInPixels = 0; // indicates an empty column
        }

        map.set(header.get('id'), columnWidthInPixels);
      });
    });
  }

  setTableHeadGrid = (tableHeadGridRef :any) => {

    this.tableHeadGrid = tableHeadGridRef;
  }

  setTableBodyGrid = (tableBodyGridRef :any) => {

    this.tableBodyGrid = tableBodyGridRef;
  }

  isColumnEmpty = (columnIndex :number) :boolean => {

    const { excludeEmptyColumns, headers } = this.props;
    const { headerIdToWidthMap } = this.state;

    const columnWidth = headerIdToWidthMap.get(
      headers.getIn([columnIndex, 'id'], ''),
      COLUMN_MIN_WIDTH
    );
    return excludeEmptyColumns && columnWidth === 0;
  }

  isLastColumn = (columnIndex :number) :boolean => {

    const { headerIdToWidthMap } = this.state;
    return columnIndex + 1 === headerIdToWidthMap.size;
  }

  getGridColumnWidth = (params :Object) :number => {

    const { headers } = this.props;
    const { headerIdToWidthMap } = this.state;

    return headerIdToWidthMap.get(
      headers.getIn([params.index, 'id'], ''),
      COLUMN_MIN_WIDTH
    );
  };

  getGridRowHeight = () :number => {
    return ROW_MIN_HEIGHT; // TODO: implement more intelligently
  };

  formatImg = (src :string) => {
    return (
      <TableImg src={src} key={src} />
    );
  }

  getCellContentFromValue = (str :any, isImg :boolean) => {
    let cellValue = str;

    if (Immutable.isIndexed(cellValue)) {
      if (!isImg) {
        cellValue = cellValue.join(' ; ');
      }
      else {
        cellValue = cellValue.map(this.formatImg);
      }
    }
    else if (isImg) {
      cellValue = this.formatImg(cellValue);
    }

    return cellValue;
  }

  getCellValue = (rowIndex :number, columnIndex :number) => {
    const { headers } = this.props;
    const { data } = this.state;

    const header :string = headers.getIn([columnIndex, 'id']);
    const isImg :boolean = data.getIn([rowIndex, 'isImg']) || headers.getIn([columnIndex, 'isImg']);
    const cellValue :string = data.getIn([rowIndex, header], '');

    return this.getCellContentFromValue(cellValue, isImg);
  }

  getCellValueInRow = (row :Map<string, any>, columnIndex :number) => {
    const { headers } = this.props;

    const header :string = headers.getIn([columnIndex, 'id'], '');
    const isImg :boolean = row.get('isImg') || headers.getIn([columnIndex, 'isImg']);
    const cellValue :string = row.get(header, '');

    return this.getCellContentFromValue(cellValue, isImg);
  }

  sortDataByColumn = (columnIndex :number) => {

    const { data } = this.props;
    const { data: stateData, sortOrder: stateSortOrder, sortedColumnIndex } = this.state;

    const getCellValueInRow = this.getCellValueInRow.bind(this);

    let sortOrder :number = stateSortOrder;

    // clicking on the same column should continue the sort order cycle
    // clicking on a different column should reset the sort order cycle
    if (columnIndex !== sortedColumnIndex) {
      sortOrder = 0;
    }

    // sortOrder === 0 means going 0 -> 1, which means sort ascending
    if (sortOrder === 0) {

      const sortedData = stateData.sort((row1, row2) => {
        const cellValue1 :any = getCellValueInRow(row1, columnIndex);
        const cellValue2 :any = getCellValueInRow(row2, columnIndex);
        if (!cellValue1) {
          return 1; // move empty string to the end
        }
        if (!cellValue2) {
          return -1; // keep empty string at the end
        }
        if (React.isValidElement(cellValue1)) {
          return 1; // not sure what to do with React components/elements. for now, move them to the end
        }
        return cellValue1.localeCompare(cellValue2);
      });

      this.setState({
        data: sortedData,
        sortedColumnIndex: columnIndex,
        sortOrder: 1
      });
    }
    // sortOrder === 1 means going 1 -> 2, which means sort descending
    else if (sortOrder === 1) {

      this.setState({
        data: stateData.reverse(), // we've already sorted ascending, so we just need to reverse
        sortedColumnIndex: columnIndex,
        sortOrder: 2
      });
    }
    // sortOrder === 2 means going 2 -> 0, which means use original order
    else {

      this.setState({
        data,
        sortedColumnIndex: columnIndex,
        sortOrder: 0
      });
    }
  }

  renderGridHeaderCell = (params :Object) => {

    if (this.isColumnEmpty(params.columnIndex)) {
      return null;
    }

    const { headers } = this.props;
    const { lastColumnOverrideMaxWidth } = this.state;

    const sortDataByColumn = this.sortDataByColumn.bind(this);
    const setMaxWidth = !lastColumnOverrideMaxWidth || !this.isLastColumn(params.columnIndex);

    return (
      <TableHeadCell
          key={params.key}
          style={params.style}
          setMaxWidth={setMaxWidth}
          onClick={() => {
            sortDataByColumn(params.columnIndex);
          }}>
        <SortIcon>
          <FontAwesomeIcon icon={faSort} />
        </SortIcon>
        <HeaderText>
          {headers.getIn([params.columnIndex, 'value'])}
        </HeaderText>
      </TableHeadCell>
    );
  }

  renderGridCell = (params :Object) => {

    if (this.isColumnEmpty(params.columnIndex)) {
      return null;
    }

    const { onRowClick } = this.props;
    const { data, hoveredRowIndex, lastColumnOverrideMaxWidth } = this.state;

    const setState = this.setState.bind(this);
    const setMaxWidth = !lastColumnOverrideMaxWidth || !this.isLastColumn(params.columnIndex);
    const cellValue :any = this.getCellValue(params.rowIndex, params.columnIndex);

    return (
      <TableBodyCell
          key={params.key}
          style={params.style}
          highlight={params.rowIndex === hoveredRowIndex}
          setMaxWidth={setMaxWidth}
          onClick={() => {
            onRowClick(params.rowIndex, data.get(params.rowIndex));
          }}
          onFocus={noop}
          onMouseLeave={() => {
            setState({
              hoveredColumnIndex: -1,
              hoveredRowIndex: -1
            });
            params.parent.forceUpdate();
          }}
          onMouseOver={() => {
            setState({
              hoveredColumnIndex: params.columnIndex,
              hoveredRowIndex: params.rowIndex
            });
            params.parent.forceUpdate();
          }}>
        {
          cellValue
        }
      </TableBodyCell>
    );
  }

  render() {

    const { data, headers, width } = this.props;

    const columnCount :number = headers.size;
    const rowCount :number = data.size;

    if (rowCount === 0) {
      return (
        <div>No data given.</div>
      );
    }

    const overscanColumnCount :number = 4;
    const overscanRowCount :number = 4;

    // this doesn't seem necessary, but the "height" prop is required :/
    let gridHeight :number = rowCount * ROW_MIN_HEIGHT;
    if (gridHeight > TABLE_MAX_HEIGHT) {
      gridHeight = TABLE_MAX_HEIGHT;
    }

    return (
      <ScrollSync>
        {
          ({ onScroll, scrollLeft }) => {
            return (
              <TableContainer>
                <TableHeadContainer>
                  <TableHeadGrid
                      cellRenderer={this.renderGridHeaderCell}
                      columnCount={columnCount}
                      columnWidth={this.getGridColumnWidth}
                      estimatedColumnSize={COLUMN_MIN_WIDTH}
                      height={ROW_MIN_HEIGHT}
                      ref={this.setTableHeadGrid}
                      overscanColumnCount={overscanColumnCount}
                      overscanRowCount={overscanRowCount}
                      rowHeight={ROW_MIN_HEIGHT}
                      rowCount={1}
                      scrollLeft={scrollLeft}
                      width={width} />
                </TableHeadContainer>
                <TableBodyContainer gridHeight={gridHeight}>
                  <TableBodyGrid
                      cellRenderer={this.renderGridCell}
                      columnCount={columnCount}
                      columnWidth={this.getGridColumnWidth}
                      estimatedColumnSize={COLUMN_MIN_WIDTH}
                      height={gridHeight}
                      ref={this.setTableBodyGrid}
                      onScroll={onScroll}
                      overscanColumnCount={overscanColumnCount}
                      overscanRowCount={overscanRowCount}
                      rowCount={rowCount}
                      rowHeight={this.getGridRowHeight}
                      width={width} />
                </TableBodyContainer>
              </TableContainer>
            );
          }
        }
      </ScrollSync>
    );
  }
}

export default DataTable;
