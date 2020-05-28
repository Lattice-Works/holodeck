/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import reactMapboxGl, {
  Feature,
  GeoJSONLayer,
  Layer,
} from 'react-mapbox-gl';
import { List, Map, Set } from 'immutable';

import mapMarker from '../../assets/images/map-marker.png';
import { HEATMAP_PAINT, MAP_STYLE } from '../../utils/constants/MapConstants';
import { MAP_COLORS } from '../../utils/constants/Colors';

declare var __MAPBOX_TOKEN__ :boolean;

const COORDS = {
  CONTINENTAL_US: [[-124.7844079, 24.7433195], [-66.9513812, 49.3457868]],
  BAY_AREA: [[-123.025192, 38.117602], [-121.170329, 37.086658]]
};

const DEFAULT_COORDS = COORDS.CONTINENTAL_US;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: absolute;
`;

const MapComponent = reactMapboxGl({
  accessToken: __MAPBOX_TOKEN__
});

type Props = {
  coordinatesByEntity :List<Map<*, *>>;
  heatmap? :boolean;
  selectEntity :(entityKeyId :?string) => void;
  selectedEntityKeyIds :Set<*>;
};

type State = {
  fitToBounds :boolean;
};

class SimpleMap extends React.Component<Props, State> {

  static defaultProps = {
    heatmap: true
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      fitToBounds: true
    };
  }

  componentWillReceiveProps(nextProps :Props) {
    const { coordinatesByEntity } = this.props;
    if (!nextProps.coordinatesByEntity.size || coordinatesByEntity !== nextProps.coordinatesByEntity) {
      this.setState({ fitToBounds: true });
    }
    else {
      this.setState({ fitToBounds: false });
    }
  }

  getBounds = () => {
    const { coordinatesByEntity } = this.props;

    /* Show bay area if no entities present to display */
    if (!coordinatesByEntity.size) {
      return DEFAULT_COORDS;
    }

    let minX;
    let maxX;
    let minY;
    let maxY;

    coordinatesByEntity.valueSeq().forEach((locationList) => {
      locationList.forEach(([x, y]) => {
        if (!minX || x < minX) {
          minX = x;
        }
        if (!maxX || x > maxX) {
          maxX = x;
        }
        if (!minY || y < minY) {
          minY = y;
        }
        if (!maxY || y > maxY) {
          maxY = y;
        }
      });
    });

    // const yDiff = maxY - minY;
    // const xDiff = maxX - minX;
    //
    // if (xDiff > yDiff) {
    //   const offset = (xDiff - yDiff) / 2;
    //   maxY += offset;
    //   minY -= offset;
    // }
    // else {
    //   const offset = (yDiff - xDiff) / 2;
    //   maxX += offset;
    //   minX -= offset;
    // }

    minX = Number.parseFloat(minX);
    minY = Number.parseFloat(minY);
    maxX = Number.parseFloat(maxX);
    maxY = Number.parseFloat(maxY);

    return [[minX, minY], [maxX, maxY]];
  }

  getFeatures = () => {
    const { coordinatesByEntity } = this.props;

    return coordinatesByEntity.valueSeq().flatMap((list) => list).map((coordinates, index) => (
      <Feature
          key={index}
          coordinates={coordinates} />
    )).toArray();
  }

  renderDefaultLayer = () => {
    const image = new Image(20, 30);
    image.src = mapMarker;
    const images = ['mapMarker', image];
    return (
      <Layer
          type="symbol"
          id="symbol"
          images={images}
          layout={{ 'icon-image': 'mapMarker' }}>
        {this.getFeatures()}
      </Layer>
    );
  }

  renderHeatmapLayer = () => (
    <Layer
        type="heatmap"
        id="heatmap"
        paint={HEATMAP_PAINT}>
      {this.getFeatures()}
    </Layer>
  )

  mapEntityToFeature = (entityKeyId :UUID, coordinates :any) => ({
    type: 'Feature',
    properties: { entityKeyId },
    geometry: {
      coordinates,
      type: 'Point',
    }
  })

  getSourceLayer = (id :string, shouldCluster :boolean) => {
    const { coordinatesByEntity } = this.props;

    const features = [];
    coordinatesByEntity.entrySeq().forEach(([entityKeyId, coordinateList]) => {
      coordinateList.forEach((coordinates) => {
        features.push(this.mapEntityToFeature(entityKeyId, coordinates));
      });
    });

    return (
      <GeoJSONLayer
          id={id}
          data={{
            type: 'FeatureCollection',
            features
          }}
          sourceOptions={{
            cluster: shouldCluster,
            clusterMaxZoom: 14,
            clusterRadius: 50
          }} />
    );
  }

  addSource = () => this.getSourceLayer('sourcefeatures', true)

  addSelectedSource = () => this.getSourceLayer('selectedsourcefeatures', false)

  addSelectedReadSource = () => this.getSourceLayer('selectedread', false)

  renderClusters = () => {
    const { selectedEntityKeyIds } = this.props;

    return (
      <Layer
          type="circle"
          sourceId="sourcefeatures"
          filter={['has', 'point_count']}
          paint={{
            'circle-opacity': selectedEntityKeyIds.size ? 0.4 : 1,
            'circle-color': MAP_COLORS[0],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              10,
              20,
              20,
              100,
              30,
              300,
              40,
              500,
              50
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': selectedEntityKeyIds.size ? 0.4 : 1
          }} />
    );
  }

  renderSelectedFeatures = () => (
    <Layer
        type="circle"
        sourceId="selectedsourcefeatures"
        paint={{
          'circle-opacity': 1,
          'circle-color': MAP_COLORS[0],
          'circle-radius': 8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 4,
          'circle-stroke-opacity': 1
        }} />
  )

  renderSelectedReadFeature = () => (
    <Layer
        type="circle"
        sourceId="selectedread"
        paint={{
          'circle-opacity': 1,
          'circle-color': '#ff3c5d',
          'circle-radius': 8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 4,
          'circle-stroke-opacity': 1
        }} />
  )

  renderSelectedFeaturesInnerCircles = () => (
    <Layer
        type="circle"
        sourceId="selectedsourcefeatures"
        paint={{
          'circle-opacity': 1,
          'circle-color': '#ffffff',
          'circle-radius': 4
        }} />
  )

  renderClusteredCounts = () => {
    return (
      <Layer
          type="symbol"
          sourceId="sourcefeatures"
          filter={['has', 'point_count']}
          layout={{
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }} />
    );
  }

  renderUnclusteredPoints = () => {
    const { selectedEntityKeyIds } = this.props;

    return (
      <Layer
          id="data-points"
          type="circle"
          sourceId="sourcefeatures"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-opacity': selectedEntityKeyIds.size ? 0.4 : 1,
            'circle-color': MAP_COLORS[0],
            'circle-radius': 6,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': selectedEntityKeyIds.size ? 0.4 : 1
          }} />
    );
  }

  onPointClick = (e :Object) => {
    const { selectEntity, selectedEntityKeyIds } = this.props;

    const { features } = e;
    if (features && features.length > 0) {
      const { properties } = features[0];
      if (properties) {
        const { entityKeyId } = properties;
        const value = selectedEntityKeyIds.has(entityKeyId) ? undefined : entityKeyId;
        selectEntity(value);
      }
    }
  }

  onMapClick = () => {
    const { selectEntity, selectedEntityKeyIds } = this.props;

    if (selectedEntityKeyIds.size) {
      selectEntity();
    }
  }

  render() {
    const { heatmap } = this.props;
    const { fitToBounds } = this.state;

    const optionalProps = fitToBounds ? {
      fitBounds: this.getBounds(),
      fitBoundsOptions: {
        padding: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      }
    } : {};

    /* eslint-disable react/jsx-props-no-spreading */
    return (
      <Wrapper>
        <MapComponent
            style={MAP_STYLE.DARK}
            onStyleLoad={(map) => {
              map.on('click', 'data-points', this.onPointClick);
            }}
            onClick={this.onMapClick}
            containerStyle={{
              height: '100%',
              width: '100%'
            }}
            {...optionalProps}>

          {this.addSource()}
          {/* {this.renderClusters()}
          {this.renderClusteredCounts()}
          {this.renderUnclusteredPoints()} */}
          {heatmap ? this.renderHeatmapLayer() : this.renderDefaultLayer()}

          {/* {this.addSelectedSource()}
          {this.addSelectedReadSource()}
          {this.renderSelectedFeatures()}
          {this.renderSelectedReadFeature()}
          {this.renderSelectedFeaturesInnerCircles()} */}

        </MapComponent>
      </Wrapper>
    );
    /* eslint-enable */
  }
}

export default SimpleMap;
