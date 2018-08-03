import {Deck, MapView, FirstPersonView, OrbitView, OrthographicView} from '@deck.gl/core';
import JSONLayer from '../json-layer/json-layer';
import MapboxMap from '../mapbox-map/mapbox-map';
import {shallowEqual} from './shallow-equal.js';

const DEFAULT_VIEW_CATALOG = {MapView, FirstPersonView, OrbitView, OrthographicView};
const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v9';

export default class JSONDeck {
  constructor(props) {
    this._onViewStateChange = this._onViewStateChange.bind(this);

    props = this._getDeckPropsFromJson(props);

    // Create a deck component
    this.deck = this._createDeck(props);

    // Create map if requested (props.mapboxgl is supplied)
    this.map = this._createMapboxMap(props);

    this.setProps(props);
  }

  finalize() {
    if (this.deck) {
      this.deck.finalize();
      this.deck = null;
    }
    if (this.map) {
      this.map.finalize();
      this.map = null;
    }
  }

  setProps(props) {
    props = this._getDeckPropsFromJson(props);

    if ('layerCatalog' in props) {
      this.layerCatalog = props.layerCatalog;
    }

    this.deck.setProps(props);

    // json now built into props
    if (props.map) {
      this.map.setProps(
        Object.assign({}, props, {
          visible: true
        })
      );
    } else {
      this.map.setProps({visible: false});
    }
  }

  // PRIVATE

  _createDeck(props) {
    const newProps = props;

    // Set any configuraton props
    newProps.onViewStateChange = this._onViewStateChange;

    // overwrite any critical initialization props. TODO - is this needed?
    if ('canvas' in props) {
      newProps.canvas = props.canvas;
    }

    return new Deck(newProps);
  }

  // Creates the base mapbox map
  // TODO - map should only be created once and made visible or invisible based on json settings
  // TODO - support base map in multiple views / multiple base maps?
  _createMapboxMap(props) {
    const mapboxApiAccessToken = props.mapboxApiAccessToken || props.mapboxApiAccessToken;
    const style = props.style || props.style || DEFAULT_MAPBOX_STYLE;

    const map =
      props.mapboxgl &&
      new MapboxMap({
        mapboxgl: props.mapboxgl,
        container: props.mapContainer,
        mapboxApiAccessToken,
        style,
        reuseMap: true
      });

    return map;
  }

  _onViewStateChange({viewState}) {
    this.deck.setProps({viewState});
    if (this.map) {
      this.map.setProps({viewState});
    }
  }

  // Lightly process `json` props and extract `views` and `layers`
  //
  // NOTE: This is only intended to provide any minimal necessary processing required to support
  // existing deck.gl props via JSON, and not implementation of alternate JSON schemas.
  // Optionally, error checking could be applied, but ideally should leverage non-JSON specific
  // mechanisms like prop types.
  // See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
  _getDeckPropsFromJson(newProps) {
    // Accept JSON strings by parsing them
    const json = typeof newProps.json === 'string' ? JSON.parse(newProps.json) : newProps.json;

    // Props for the top level `Deck` component, with props, views and layers extracted from JSON
    // Merge top-level JSON into props: Top level JSON props take precedence
    const props = Object.assign({}, newProps, json);

    // Get rid of the `json` prop
    delete props.json;

    // Convert "JSON layers" in props.json.layers into class instances
    if (props.layers) {
      props.layers = this._getJSONLayers(props.layers);
    }

    if (props.views) {
      // Convert  "JSON views" in props.json.views into class instances
      props.views = this._getJSONViews(props.views);
    }

    // Handle json.initialViewState
    // If we receive new JSON we need to decide if we should update current view state
    // Current heuristic is to compare with last initialViewState and only update if changed
    if ('initialViewState' in props) {
      const updateViewState =
        !this.initialViewState || !shallowEqual(props.initialViewState, this.initialViewState);
      if (updateViewState) {
        props.viewState = props.initialViewState;
        this.initialViewState = props.initialViewState;
      }
      delete props.initialViewState;
    }

    return props;
  }

  // Use the composite JSONLayer to render any JSON layers
  _getJSONLayers(jsonLayers) {
    return [
      new JSONLayer({
        data: jsonLayers,
        layerCatalog: this.layerCatalog
      })
    ];
  }

  // Instantiates views: `{type: MapView, ...props}` to `MapView(...props)`
  _getJSONViews(jsonViews) {
    if (!jsonViews) {
      return jsonViews;
    }

    jsonViews = Array.isArray(jsonViews) ? jsonViews : [jsonViews];
    return jsonViews
      .map(jsonView => {
        // Try to find a view definition
        let View = null;
        if (this.viewCatalog) {
          View = this.viewCatalog[jsonView.type];
        }
        if (!View) {
          View = DEFAULT_VIEW_CATALOG[jsonView.type];
        }
        // Instantiate it
        return View && new View(jsonView);
      })
      .filter(Boolean);
  }
}
