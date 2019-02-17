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

var area = function (datum, boolean) {
  return d3.area()
    .curve(d3.curveBasis)
    .y0(height)
    .y1(function (d) { return yPositionScale(d.altitude_feet) })
    .x(function (d) { return boolean ? xPositionScale(d.distance_miles) : 0 })
    (datum)
}

// const line = d3
//   .line()
//   .x(d => {
//     return xPositionScale(d.distance_miles)
//   })
//   .y(d => {
//     return yPositionScale(d.altitude_feet)
//   })

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

  // svg
  //   .datum(datapoints)
  //   .append('path')
  //   .attr('class', 'line')
  //   .attr('stroke', 'brown')
  //   .attr('stroke-width', 2)
  //   .attr('d', line)
  //   .attr('fill', 'none')
  //   .attr('id', 'mud-line')
  //   .style('visibility', 'hidden')

  // add the area
  svg
    .datum(datapoints)
    .append('path')
    .attr('class', 'area')

  var mudLine = d3.select('#mud-line')

  // add the circle
  // svg
  //   .append('circle')
  //   .attr('fill', 'red')
  //   .attr('r', 4)
  //   .attr('class', 'circle')
  //   .style('visibility', 'hidden')

  // add dashed line
  svg
    .append('line')
    .attr('class', 'riverLine')
    .attr('stroke', 'gray')
    .attr('stroke-width', 0.5)
    .style('stroke-dasharray', ('3, 3'))
    .attr('x1', xPositionScale(4.14))
    .attr('y1', height)
    .attr('x2', xPositionScale(4.14))
    .attr('y2', height)
    .lower()
    // .attr('opacity', 0)
    // .style('visibility', 'hidden')

  svg.append('line')
    .attr('class', 'line-arrow')
    .attr('x1', xPositionScale(4.14))
    .attr('y1', 350)
    .attr('x2', xPositionScale(4.14))
    .attr('y2', 350)
    .attr('stroke-width', 0.5)
    .attr('stroke', 'gray')
    .attr('marker-end', 'url(#triangle)')
    // .attr('opacity', 0)
    .lower()

  svg
    .append('text')
    .attr('class', 'river-label')
    .text('Paraopeba river')
    .attr('dx', 10)
    .attr('y', d => yPositionScale(2450))
    .attr('x', d => xPositionScale(4.14))
    .attr('text-anchor', 'start')
    // .attr('opacity', 0)
    .style('visibility', 'hidden')

  svg
    .append('text')
    .attr('class', 'dam-label')
    .text('Collapsed dam')
    .attr('dx', 10)
    .attr('y', d => yPositionScale(2933))
    .attr('x', d => xPositionScale(0))
    .attr('text-anchor', 'start')
    // .attr('opacity', 0)
    .style('visibility', 'hidden')

  // Axes labels

  svg
    .append('text')
    .attr('class', 'text-y-axis')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .attr('font-family', 'Open Sans')
    .attr('font-size', 13)
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
    .attr('font-size', 13)
    .text('Distance (miles)')

  /* Add in your axes */

  const xAxis = d3
    .axisBottom(xPositionScale)
    .ticks(7)
    .tickSize(0)

  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .attr('dy', 20)
    .attr('y', '10px')

  const yAxis = d3
    .axisLeft(yPositionScale)
    .ticks(7)
    .tickSize(0)

  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)
    .attr('dx', 20)
    .attr('x', '10px')

  // steps
  d3.select('#blank-graph').on('stepin', () => {
    svg
      .selectAll('.line')
      .transition()
      .style('visibility', 'hidden')

    svg
      .selectAll('.circle')
      .style('visibility', 'hidden')

    svg
      .datum(datapoints)
      .append('path')
      .attr('class', 'area')
      .style('visibility', 'hidden')

    svg
      .selectAll('.area')
      .attr('d', d => area(d, false))
      .attr('fill', '#993333')
      // .transition()
      // .duration(2000)
      // .attr('d', d => area(d, true))

    svg
      .select('.riverLine')
      .transition()
      .attr('x1', xPositionScale(4.14))
      .attr('y1', height)
      .attr('x2', xPositionScale(4.14))
      .attr('y2', height)

    svg
      .select('.line-arrow')
      .transition()
      .attr('x1', xPositionScale(4.14))
      .attr('y1', 350)
      .attr('x2', xPositionScale(4.14))
      .attr('y2', 350)

    svg
      .selectAll('.river-label')
      .transition()
      .style('visibility', 'hidden')

    svg
      .selectAll('.dam-label')
      .transition()
      .style('visibility', 'hidden')
  })

  d3.select('#animated-line').on('stepin', () => {
    console.log('I am stepping into line')
    svg
      .selectAll('.area')
      .attr('d', d => area(d, false))
      .attr('fill', '#993333')
      .transition()
      .duration(2000)
      .attr('d', d => area(d, true))
  })

  // Label collapsed dam

  svg
    .append('text')
    .attr('class', 'dam-label')
    .text('Collapsed dam')
    .attr('font-family', 'Open Sans')
    .attr('font-size', 12)
    .attr('dx', 10)
    .attr('y', d => yPositionScale(2933))
    .attr('x', d => xPositionScale(0))
    .attr('text-anchor', 'start')
    // .attr('opacity', 0)
    .style('visibility', 'hidden')
    // .attrTween('transform', translateAlong(mudLine))

  // Label river
  svg
    .selectAll('.river-label')
    .transition()
    .style('visibility', 'hidden')

  svg
    .selectAll('.dam-label')
    .transition()
    .style('visibility', 'hidden')

  // reset River line

  svg
    .select('.riverLine')
    .transition()
    .attr('x1', xPositionScale(4.14))
    .attr('y1', height)
    .attr('x2', xPositionScale(4.14))
    .attr('y2', height)

  svg
    .select('.line-arrow')
    .transition()
    .attr('x1', xPositionScale(4.14))
    .attr('y1', 350)
    .attr('x2', xPositionScale(4.14))
    .attr('y2', 350)

  svg
    .selectAll('.river-label')
    .transition()
    .style('visibility', 'hidden')

  // Arrow

  svg.append('svg:defs').append('svg:marker')
    .attr('class', 'arrow')
    .attr('refX', 6)
    .attr('refY', 6)
    .attr('markerWidth', 25)
    .attr('markerHeight', 25)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 12 6 0 12 3 6')
    .style('fill', 'gray')
    .style('visibility', 'visible')

  // Second step

  d3.select('#river-line').on('stepin', () => {
    console.log('I am stepping into river line')

    svg
      .select('.riverLine')
      .transition()
      .duration(1000)
      .attr('x2', xPositionScale(4.14))
      .attr('y2', 0)
      .attr('opacity', 1)
      // .style('visibility', 'visible')

    // Arrow

    svg
      .select('.line-arrow')
      .transition()
      .duration(1000)
      .attr('x2', xPositionScale(5.5))
      .attr('y2', 350)
      .attr('opacity', 1)
      .attr('stroke-width', 0.5)
      .attr('stroke', 'gray')
      .attr('marker-end', 'url(#triangle)')

    // svg
    //   .selectAll('.arrow')
    //   .transition()
    //   .duration(1000)
    //   // .append('svg:defs')
    //   // .append('svg:marker')
    //   .attr('refX', 6)
    //   .attr('refY', 6)
    //   .attr('markerWidth', 25)
    //   .attr('markerHeight', 25)
    //   .attr('orient', 'auto')
    //   // .append('path')
    //   .attr('d', 'M 0 0 12 6 0 12 3 6')
    //   .style('visibility', 'visible')
    //   .style('fill', 'gray')

    // Label collapsed dam

    svg
      .selectAll('.dam-label')
      .transition()
      .style('visibility', 'visible')

    // Label river

    svg
      .selectAll('.river-label')
      .transition()
      .style('visibility', 'visible')
      .attr('font-size', 12)
      .attr('dx', 10)
      .attr('y', d => yPositionScale(2450))
      .attr('x', d => xPositionScale(4.14))
  })
  // function render () {
  //   console.log('Something happened')
  //   let screenWidth = svg.node().parentNode.parentNode.offsetWidth
  //   let screenHeight = window.innerHeight
  //   let newWidth = screenWidth - margin.left - margin.right
  //   let newHeight = screenHeight - margin.top - margin.bottom

  //   // Update your SVG
  //   let actualSvg = d3.select(svg.node().parentNode)
  //   actualSvg
  //     .attr('height', newHeight + margin.top + margin.bottom)
  //     .attr('width', newWidth + margin.left + margin.right)

  //   console.log(actualSvg)

  //   // Update scales (depends on your scales)
  //   xPositionScale.range([0, newWidth])
  //   yPositionScale.range([newHeight, 0])

  //   // Reposition/redraw your elements

  //   svg
  //     .selectAll('.area')
  //     .attr('d', area)

  //   // Update axes if necessary
  //   svg.select('.x-axis').call(xAxis)
  //   svg.select('.y-axis').call(yAxis)
  // }

  // // Every time the window resizes, run the render function
  // window.addEventListener('resize', debounce(render, 200))
  // render()
}
