export const STATE = {
  ENTITY_SETS: 'ENTITY_SETS',
  EXPLORE: 'EXPLORE',
  TOP_UTILIZERS: 'TOP_UTILIZERS'
};

export const ENTITY_SETS = {
  ENTITY_SET_SEARCH_RESULTS: 'entitySetSearchResults',
  ENTITY_SET_SIZES: 'entitySetSizes',
  IS_LOADING_ENTITY_SETS: 'isLoadingEntitySets',
  SELECTED_ENTITY_SET: 'selectedEntitySet',
  SHOW_ASSOCIATION_ENTITY_SETS: 'showAssociationEntitySets',
  SHOW_AUDIT_ENTITY_SETS: 'showAuditEntitySets',
  PAGE: 'pageNum',
  TOTAL_HITS: 'totalHits'
};

export const EXPLORE = {
  BREADCRUMBS: 'breadcrumbs',
  ENTITIES_BY_ID: 'entitiesById',
  ENTITY_NEIGHBORS_BY_ID: 'entityNeighborsById',
  FILTERED_PROPERTY_TYPES: 'filteredPropertyTypes',
  IS_LOADING_ENTITY_NEIGHBORS: 'isLoadingEntityNeighbors',
  IS_SEARCHING_DATA: 'isSearchingData',
  SEARCH_RESULTS: 'searchResults',
  UNFILTERED_SEARCH_RESULTS: 'unfilteredSearchResults',
  LOCATIONS_BY_ENTITY: 'locationsByEntity'
};

export const TOP_UTILIZERS = {
  COUNT_BREAKDOWN: 'countBreakdown',
  IS_DOWNLOADING_TOP_UTILIZERS: 'isDownloadingTopUtilizers',
  IS_LOADING_NEIGHBOR_TYPES: 'isLoadingNeighborTypes',
  IS_LOADING_TOP_UTILIZERS: 'isLoadingTopUtilizers',
  IS_LOADING_TOP_UTILIZER_NEIGHBORS: 'isLoadingTopUtilizerNeighbors',
  LAST_QUERY_RUN: 'lastTopUtilizersQueryRun',
  NUMBER_OF_UTILIZERS: 'numberOfUtilizers',
  TOP_UTILIZER_FILTERS: 'topUtilizerFilters',
  NEIGHBOR_TYPES: 'neighborTypes',
  RESULT_DISPLAY: 'topUtilizerResultDisplay',
  QUERY_HAS_RUN: 'queryHasRun',
  TOP_UTILIZER_RESULTS: 'topUtilizerResults',
  UNFILTERED_TOP_UTILIZER_RESULTS: 'unfilteredTopUtilizerResults'
};
