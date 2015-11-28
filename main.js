// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

var document = require('global/document');
var React = require('react');
var r = require('r-dom');
var window = require('global/window');
var bartData = require('./data/bart-routes.json');
var BartStations = require('./views/bart-stations.react');

var stations = {};
var routes = {};

bartData.stations.forEach(function _getCoords(station) {
  stations[station.abbr] = [station.latitude, station.longitude, station.name];
});

bartData.routes.forEach(function _buildRoutes(route) {
  routes[route.abbr] = route.stations.map(function _getCoords(station) {
    return stations[station];
  });
});

function getAccessToken() {
  var match = window.location.search.match(/access_token=([^&\/]*)/);
  var accessToken = match && match[1];
  if (accessToken) {
    window.localStorage.accessToken = accessToken;
  } else {
    accessToken = window.localStorage.accessToken;
  }
  return accessToken;
}

var App = React.createClass({

  displayName: 'App',

  getInitialState: function getInitialState() {
    return {
      routeSelected: false
    };
  },

  handleChange: function(e) {
    this.setState({
      routeSelected: routes[e.target.value]
    });
  },

  render: function render() {
    var common = {
      width: 1000,
      height: 500,
      mapStyle: 'mapbox://styles/mapbox/dark-v8',
      routeSelected: this.state.routeSelected,
      mapboxApiAccessToken: getAccessToken()
    };
    return r.div({className: 'container'}, [ 
      r.div({className: 'header'}, [
        r.h1('BART Route Visualizer'),
        r.h3([r.span('An application using '), r.a({href:'https://github.com/uber/react-map-gl', target: '_blank'}, [r.span('react-map-gl')])]),
        r.select({name: 'route-dropdown', defaultValue: '', onChange: this.handleChange}, [
          r.option({value: '', label: 'Select a route...', disabled: true}),
          r.option({value: 'M-R', label: 'Millbrae-Richmond'}),
          r.option({value: 'M-PBP', label: 'Millbrae-Pittsburg/Bay Point'}),
          r.option({value: 'DC-DP', label: 'Daly City - Dublin/Pleasanton'}),
          r.option({value: 'DC-F', label: 'Daly City - Fremont'}),
          r.option({value: 'R-F', label: 'Richmond - Fremont'})
        ])
      ]),
      r.div({className: 'map-container'}, [
        r.div({className: 'inner-map-container'}, [
          r(BartStations, common)
        ])
      ])
    ]);
  }
});

React.render(r(App), document.body);
