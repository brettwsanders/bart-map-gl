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

var assign = require('object-assign');
var React = require('react');
var d3 = require('d3');
var r = require('r-dom');
var alphaify = require('alphaify');
var window = require('global/window');
var windowAlert = window.alert;

var MapGL = require('react-map-gl');
var SVGOverlay = require('react-map-gl/src/overlays/svg.react');
var CanvasOverlay = require('react-map-gl/src/overlays/canvas.react');
var color = d3.scale.category10();

var bartData = require('./../data/bart-routes.json');

var stations = bartData.stations.map(function _getCoords(station) {
  return [station.latitude, station.longitude];
});

var getTodaysDate = function() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd;
  } 

  if(mm<10) {
      mm='0'+mm;
  } 

  return mm+'/'+dd+'/'+yyyy;
};

var today = getTodaysDate();

var RouteOverlayExample = React.createClass({
  displayName: 'RouteOverlayExample',

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      latitude: 37.774963,
      longitude: -122.224274,
      zoom: 9.1,
      startDragLatLng: null,
      isDragging: false,
      strokeWidth: 7,
      strokeOpacity: 0.6
    };
  },

  _onChangeViewport: function _onChangeViewport(opt) {
    this.setState({
      latitude: opt.latitude,
      longitude: opt.longitude,
      zoom: opt.zoom,
      startDragLatLng: opt.startDragLatLng,
      isDragging: opt.isDragging
    });
  },

  _renderRoute: function _renderRoute(points) {
    return r.g({style: {pointerEvents: 'click', cursor: 'pointer'}}, [
      r.g({
        style: {pointerEvents: 'visibleStroke'},
      }, [
        r.path({
          d: 'M' + points.join('L'),
          style: {
            fill: 'none',
            stroke: alphaify('#1FBAD6', this.state.strokeOpacity),
            strokeWidth: this.state.strokeWidth
          }
        })
      ])
    ]);
  },

  _mouseOver: function _mouseOver(e) {
    this.setState({
      strokeWidth: 8,
      strokeOpacity: 0.7
    });
  },

  _mouseOut: function _mouseOut(e) {
    this.setState({
      strokeWidth: 7,
      strokeOpacity: 0.6
    });
  },

  _clickHandler: function _clickHandler(e) {
    window.open('https://www.bart.gov/schedules/bylineresults?route=' + this.props.routeNumber + '&date=' + today, '_blank');
  },

  _redrawSVGOverlay: function _redrawSVGOverlay(opt) {
    var index = 0;
    var points = this.props.routeSelected.map(opt.project).map(function __map(p) {
      return [d3.round(p.x, 1), d3.round(p.y, 1)];
    });
    return r.g({
      key: index, 
      onMouseOver: this._mouseOver, 
      onMouseOut: this._mouseOut,
      onClick: this._clickHandler
    }, 
      this._renderRoute(points));
  },

  _redrawCanvasOverlay: function _redrawCanvasOverlay(opt) {
    var ctx = opt.ctx;
    var width = opt.width;
    var height = opt.height;
    ctx.clearRect(0, 0, width, height);
    stations.map(opt.project).forEach(function _forEach(p, i) {
      var point = [d3.round(p.x, 1), d3.round(p.y, 1)];
      ctx.fillStyle = alphaify('#1FBAD6', 1);
      ctx.beginPath();
      ctx.arc(point[0], point[1], 3, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  render: function render() {
    var overlays = [r(CanvasOverlay, {redraw: this._redrawCanvasOverlay})];
    if (this.props.routeSelected) {
      overlays.push(r(SVGOverlay, {redraw: this._redrawSVGOverlay}));
    }
    return r(MapGL, assign({
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      zoom: this.state.zoom,
      width: this.props.width,
      height: this.props.height,
      startDragLatLng: this.state.startDragLatLng,
      isDragging: this.state.isDragging,
      onChangeViewport: this.props.onChangeViewport || this._onChangeViewport
    }, this.props), overlays);
  }
});

module.exports = RouteOverlayExample;
