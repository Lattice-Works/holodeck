export const STATE = {
  EDM: 'EDM',
  ENTITY_SETS: 'ENTITY_SETS',
  EXPLORE: 'EXPLORE',
  TOP_UTILIZERS: 'TOP_UTILIZERS'
};

export const EDM = {
  EDM_WAS_LOADED: 'edmWasLoaded',
  ENTITY_SETS_BY_ID: 'entitySetsById',
  ENTITY_TYPES_BY_ID: 'entityTypesById',
  ENTITY_TYPES_BY_FQN: 'entityTypesByFqn',
  PROPERTY_TYPES_BY_ID: 'propertyTypesById',
  PROPERTY_TYPES_BY_FQN: 'propertyTypesByFqn'
};

export const ENTITY_SETS = {
  ENTITY_SET_SEARCH_RESULTS: 'entitySetSearchResults',
  IS_LOADING_ENTITY_SETS: 'isLoadingEntitySets',
  SELECTED_ENTITY_SET: 'selectedEntitySet',
  SELECTED_ENTITY_SET_PROPERTY_TYPES: 'selectedEntitySetPropertyTypes',
  IS_PERSON_TYPE: 'isPersonType'
};

export const EXPLORE = {
  IS_LOADING_ENTITY_NEIGHBORS: 'isLoadingEntityNeighbors',
  ENTITIES_BY_ID: 'entitiesById',
  ENTITY_NEIGHBORS_BY_ID: 'entityNeighborsById',
  BREADCRUMBS: 'breadcrumbs'
};

export const TOP_UTILIZERS = {
  COUNT_BREAKDOWN: 'countBreakdown',
  IS_LOADING_NEIGHBOR_TYPES: 'isLoadingNeighborTypes',
  IS_LOADING_TOP_UTILIZERS: 'isLoadingTopUtilizers',
  IS_LOADING_TOP_UTILIZER_NEIGHBORS: 'isLoadingTopUtilizerNeighbors',
  TOP_UTILIZER_FILTERS: 'topUtilizerFilters',
  TOP_UTILIZER_NEIGHBOR_DETAILS: 'topUtilizerNeighborDetails',
  NEIGHBOR_TYPES: 'neighborTypes',
  RESULT_DISPLAY: 'topUtilizerResultDisplay',
  TOP_UTILIZER_RESULTS: 'topUtilizerResults',
  QUERY_HAS_RUN: 'queryHasRun'
};
