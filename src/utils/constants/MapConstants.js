export const MAP_STYLE = {
  DEFAULT: 'mapbox://styles/mapbox/streets-v9',
  DARK: 'mapbox://styles/mapbox/dark-v9',
  LIGHT: 'mapbox://styles/mapbox/light-v9'
};

export const HEATMAP_PAINT = {
  // increase weight as diameter breast height increases
  'heatmap-weight': {
    property: 'dbh',
    type: 'exponential',
    stops: [
      [1, 0],
      [62, 1]
    ]
  },
  // increase intensity as zoom level increases
  'heatmap-intensity': {
    stops: [
      [11, 1],
      [15, 3]
    ]
  },
  // assign color values be applied to points depending on their density
  // increase radius as zoom increases
  'heatmap-radius': {
    stops: [
      [11, 15],
      [15, 20]
    ]
  },
  'heatmap-color': [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0, 'rgba(0, 0, 0, 0)',
    0.2, '#081d58',
    0.4, '#225ea8',
    0.6, '#41b6c4',
    0.8, '#c7e9b4',
    1, '#ffffd9'
  ]
  // decrease opacity to transition into the circle layer
  // 'heatmap-opacity': {
  //   default: 1,
  //   stops: [
  //     [14, 1],
  //     [15, 0]
  //   ]
  // }
};
