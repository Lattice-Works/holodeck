export const getEdmFromState = (state) => state.get('edm');

export const getPropertyTypeByKey = (edm, key) => {

  const index = edm.getIn(['propertyTypesIndexMap', key]);
  if (Number.isNaN(index)) {
    return null;
  }

  return edm.getIn(['propertyTypes', index]);
};

export const getPropertyTypeFQNById = (edm, id) => {
  const propertyType = getPropertyTypeByKey(edm, id);

  const namespace = propertyType.getIn(['type', 'namespace']);
  const name = propertyType.getIn(['type', 'name']);

  return `${namespace}.${name}`;
};
