# MapboxMap

A minimal wrapper around mapbox-gl that supports a deck.gl style `viewState` prop, by providing a deck.gl style `constructor` and `setProps` methods.


## Usage

Create a new MapboxMap instance.

```js
import mapboxgl from 'mapbox-gl';
const map = new MapboxMap({mapboxgl, ... });
```


## Methods


### constructor(props: Object)

The constructor handles the properties listed below and passes on all other props (such as "style") to mapbox-gl.


### setProps(props: Object) : MapboxMap

Handles `props.viewState` only, translating it into mapbox props.


## Properties

### `mapboxgl` : MapboxGL

Reference to the main mapbox-gl class, must be imported from `mapbox-gl` and supplied in this prop.


### `mapboxApiAccessToken` : String

A mapbox token.


### `viewState` : Object

Object with view state fields.


## Remarks

* deck.gl itself does not import mapbox-gl. The application is responsible for importing mapboxgl and passing it in as a prop to `MapboxMap`.
