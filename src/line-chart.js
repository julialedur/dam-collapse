import * as d3 from 'd3'
import { debounce } from 'debounce'
import * as topojson from 'topojson'

const margin = { top: 30, left: 70, right: 10, bottom: 60 }
const height = 500 - margin.top - margin.bottom
const width = 800 - margin.left - margin.right

const svg = d3
  .select('#line-chart')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Normal scales
const xPositionScale = d3
  .scaleLinear()
  .domain([0, 7])
  .range([0, width])

const yPositionScale = d3
  .scaleLinear()
  .domain([2400, 3000])
  .range([height, 0])

const line = d3
  .line()
  .x(d => {
    return xPositionScale(d.distance_miles)
  })
  .y(d => {
    return yPositionScale(d.altitude_feet)
  })

d3.csv(require('./data/altitude-distance.csv'))
  .then(ready)
  .catch(err => {
    console.log('Failed with', err)
  })

function ready (datapoints) {
  function tweenDash () {
    var l = this.getTotalLength()

    var i = d3.interpolateString('0,' + l, l + ',' + l)
    return function (t) {
      return i(t)
    }
  }

  function translateAlong (path) {
    var l = path.node().getTotalLength()
    return function (d, i, a) {
      return function (t) {
        var p = path.node().getPointAtLength(t * l)
        return 'translate(' + p.x + ',' + p.y + ')'
      }
    }
  }

  // .append('path') because we only want ONE path
  // .datum because we only have ONE path

  svg
    .append('path')
    .datum(datapoints)
    .attr('stroke', 'brown')
    .attr('stroke-width', 2)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('id', 'mud-line')
    .transition()
    .duration(5000)
    .attrTween('stroke-dasharray', tweenDash)

  var mudLine = d3.select('#mud-line')
  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('fill', 'brown')
    .attr('r', 3)
    .attr('cx', d => {
      return xPositionScale(d.distance_miles)
    })
    .attr('cy', d => {
      return yPositionScale(d.altitude_feet)
    })
    .transition()
    .duration(5000)
    // .attrTween('transform', translateAlong(mudLine))

  // Axes labels

  svg
    .append('text')
    .attr('class', 'text-y-axis')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .attr('font-family', 'Open Sans')
    .attr('font-size', 12)
    .style('text-anchor', 'middle')
    .text('Altitude (feet)')

  svg
    .append('text')
    .attr('class', 'text-x-axis')
    .attr('text-anchor', 'middle')
    .attr('y', height)
    .attr('dy', 45)
    .attr('x', width / 2)
    .attr('font-family', 'Open Sans')
    .attr('font-size', 12)
    .text('Distance (miles)')

  // Add fill rectangles

  svg.append('g')
    .selectAll('rect')
    .data(datapoints)
    .enter().append('rect')
    .attr('class', 'highlighter')
    .attr('y', 0)
    .attr('x', d => xPositionScale(d.distance_miles))
    .attr('height', height)
    .attr('width', xPositionScale(2) - xPositionScale(1))
    .attr('fill', '#fff880')
    .attr('opacity', 0.2)

  /* Add in your axes */

  const xAxis = d3.axisBottom(xPositionScale).ticks(7)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale).ticks(7)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
}

export { xPositionScale, yPositionScale, line }
