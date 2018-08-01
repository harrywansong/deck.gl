import DeckGL from './deckgl.js';
const deckGLCoreLayers = require('@deck.gl/layers');

export default class DeckGLJSON {
  constructor(json, layers = Object.values(deckGLCoreLayers)) {
    const props = Object.assign(
      {
        mapboxApiAccessToken: process.env.MapboxAccessToken // eslint-disable-line
      },
      json,
      {
        // views: this.getJSONViews(json.views),
        layers: this.getJSONLayers(json.layers, layers)
      }
    );

    this.deck = new DeckGL(props);
  }

  getJSONViews(json = null) {
    return json;
  }

  getJSONLayers(jsonLayers = [], layers) {
    // assert(Array.isArray(jsonLayers));
    return jsonLayers.map(jsonLayer => {
      const Layer = layers.find(layer => layer.layerName === jsonLayer.type);
      return Layer && new Layer(jsonLayer);
    });
  }
}
