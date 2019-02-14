import * as d3 from 'd3'
import { debounce } from 'debounce'
import * as topojson from 'topojson'

const margin = {
  top: 30,
  right: 20,
  bottom: 30,
  left: 30
}

const width = 1000 - margin.left - margin.right
const height = 700 - margin.top - margin.bottom

const svg = d3
  .select('#map_chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
let path = d3.geoPath().projection(projection)

// const xPositionScale = d3.scalePoint().range([0, width])

// var yPositionScale = d3
//   .scaleLinear()
//   .range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#4b1803',
    '#726737',
    '#d9a746',
    '#bb5e22',
    '#739aa6'
  ])

var div = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

Promise.all([
  d3.json(require('./data/br_mg.topojson')),
  d3.csv(require('./data/br_dam_final.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready ([json, datapoints]) {
  console.log(json.objects)
  let cities = topojson.feature(json, json.objects.municipios_2010)
  projection.fitSize([width, height], cities)

  console.log('Datapoints look like', datapoints)

  var cityList = ['Belo Horizonte',
    'Uberlândia',
    'Montes Claros',
    'Brumadinho',
    'Mariana',
    'Governador Valadares']

  svg
    .selectAll('.cities')
    .data(cities.features)
    .enter()
    .append('path')
    .attr('class', 'cities')
    .attr('d', path)
    .attr('stroke', '#e6e6e6')
    .attr('stroke-width', 0.6)
    .attr('fill', 'white')

  svg
    .selectAll('.label')
    .data(cities.features)
    .enter()
    .append('text')
    .attr('font-weight', 200)
    .attr('letter-spacing', 0.3)
    .attr('class', d => {
      return d.properties.nome.replace(/\s+/g, '-').toLowerCase()
    })
    .classed('label', true)
    .text(d => {
      if ((cityList.indexOf(d.properties.nome) !== -1) && (d.properties.nome === 'Governador Valadares')) {
        return d.properties.nome + ' •'
      } else if ((cityList.indexOf(d.properties.nome) !== -1) && (d.properties.nome !== 'Governador Valadares')) {
        return '• ' + d.properties.nome
      } else {
        return ' '
      }
    })
    .attr('transform', d => {
      let coords = projection(d3.geoCentroid(d))
      return `translate(${coords})`
    })
    .attr('dy', d => {
      if (d.properties.nome === 'Mariana') {
        return 5
      }
    })
    .attr('dx', d => {
      if (d.properties.nome === 'Brumadinho') {
        return 10
      }
    })
    .attr('text-anchor', d => {
      if (d.properties.nome === 'Governador Valadares') {
        return 'end'
      } else {
        return 'start'
      }
    })
    .attr('alignment-baseline', 'middle')
    .style('visibility', 'hidden')
    .attr('font-size', 3)

  svg
    .selectAll('.rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('class', d => {
      // console.log(d)
      // console.log(d.dam_name.replace(' ', '-').toLowerCase())
      var str = d['dam_name'].replace(/[\(\)]/g, '')
      // console.log(str.replace(/\s+/g, '-').toLowerCase())
      return str.replace(/\s+/g, '-').toLowerCase()
    })
    .classed('dam', true)
    .attr('id', d => {
      if ((d.company_name === 'Vale Fertilizantes S A') || (d.company_name === 'Vale S A')) {
        return 'vale'
      } else {
        return 'other'
      }
    })
    // .attr('r', 2.3)
    .attr('width', 8)
    .attr('height', 8)
    .attr('transform', d => {
      let coords = projection([d.longitude, d.latitude])
      return `translate(${coords})rotate(-45)`
    })
    .attr('stroke-width', 1)
    .attr('fill', 'white')
    .attr('opacity', 0)
    .attr('stroke', d => colorScale(d.risk_category))
    .attr('visibility', 'hidden')
    .on('mouseover', function (d) {
      // set up tooltip text
      div
        .transition()
        .duration(200)
        .style('opacity', 0.9)
      div
        .html('<strong>' + 'Dam Name: ' + '</strong>' + d.dam_name + '<br>' +
              '<strong>' + 'City: ' + '</strong>' + d.city + '<br>' +
              '<strong>' + 'Owned by: ' + '</strong>' + d.company_name)
        .style('left', d3.event.pageX + 20 + 'px')
        .style('top', d3.event.pageY - 28 + 'px')
    })
    .on('mouseout', function (d) {
      div
        .transition()
        .duration(500)
        .style('opacity', 0)
    })

  // scrolling part
  // initial blank map
  d3.select('#blank').on('stepin', () => {
    svg
      .selectAll('.dam')
      .style('visibility', 'hidden')

    svg
      .selectAll('.label')
      .style('visibility', 'visible')
      .transition()
      .duration(200)
      .attr('opacity', 1)
  })

  // showing the collapsed dam
  d3.select('#dam').on('stepin', () => {
    svg
      .selectAll('.dam')
      .transition()
      .duration(200)
      .style('visibility', 'hidden')
      .attr('opacity', 0)
    svg
      .select('.barragem-i-córrego-feijão')
      .transition()
      .duration(200)
      .style('visibility', 'visible')
      .attr('opacity', 0.9)
      .attr('r', 3)
      .attr('stroke', '#993333')

    svg
      .selectAll('.label')
      .transition()
      .duration(200)
      .attr('opacity', 0)
    svg
      .selectAll('.brumadinho')
      .transition()
      .duration(200)
      .attr('opacity', 1)
  })

  // showing the dam collapsed three years ago
  d3.select('#previous').on('stepin', () => {
    svg
      .selectAll('.dam')
      .transition()
      .duration(200)
      .attr('opacity', 0)
    svg
      .select('.fundão')
      .style('visibility', 'visible')
      .transition()
      .duration(200)
      .attr('opacity', 0.9)
      .attr('r', 3)
      .attr('stroke', '#993333')

    svg
      .selectAll('.label')
      .transition()
      .duration(200)
      .attr('opacity', 0)
    svg
      .selectAll('.mariana')
      .transition()
      .duration(200)
      .attr('opacity', 1)
  })

  // showing all the dam in MG on risks
  d3.select('#risk').on('stepin', () => {
    svg
      .selectAll('.dam')
      .style('visibility', 'visible')
      .attr('opacity', d => {
        if ((d['risk_category'] === 'ALTO') || (d['risk_category'] === 'MÉDIO')) {
          return 0.8
        } else {
          return 0
        }
      })
    svg
      .selectAll('.label')
      .transition()
      .duration(200)
      .attr('opacity', 0)
    // svg
    //   .selectAll('.brumadinho')
    //   .transition()
    //   .duration(200)
    //   .attr('opacity', 1)
  })

  // showing all the dam in MG on potential dmage
  d3.select('#potential_damage').on('stepin', () => {
    svg
      .selectAll('.dam')
      .style('visibility', 'visible')
      .attr('opacity', d => {
        if (d['potential_damage'] === 'ALTO') {
          return 0.8
        } else {
          return 0
        }
      })
      .attr('stroke', d => colorScale(d.risk_category))

    svg
      .selectAll('.label')
      .style('visibility', 'visible')
      .transition()
      .duration(200)
      .attr('opacity', 0)
  })

  // showing all the dam owned by Vale
  d3.select('#company').on('stepin', () => {
    svg
      .selectAll('.dam')
      // .style('visibility', 'visible')
      .transition()
      .duration(200)
      .style('visibility', d => {
        if ((d.company_name === 'Vale Fertilizantes S A') || (d.company_name === 'Vale S A')) {
          return 'visible'
        } else {
          return 'hidden'
        }
      })
      .attr('stroke', 'gray')
  })

  // showing all the dams will get checked
  d3.select('#check').on('stepin', () => {
    var checkList = ['Barragem B-2', 'Barragem B-1', 'Barragem B-4', 'Gafanhoto', 'Cajuru', 'Retiro Baixo']
    svg
      .selectAll('.dam')
      .attr('opacity', d => {
        if (checkList.indexOf(d['dam_name']) !== -1) {
          return 0.8
        } else {
          return 0
        }
      })
      .style('visibility', 'visible')
      .transition()
      .duration(200)
      // .attr('stroke', 'gray')
  })

  // Make it responsive
  function render () {
    // Calculate height/width
    console.log('Rendering')
    let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let screenHeight = window.innerHeight
    // let screenHeight = window.innerHeight
    // let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let newWidth = screenWidth - margin.left - margin.right
    let newHeight = screenHeight - margin.top - margin.bottom

    // Update your SVG
    let actualSvg = d3.select(svg.node().parentNode)
    actualSvg
      .attr('height', newHeight + margin.top + margin.bottom)
      .attr('width', newWidth + margin.left + margin.right)

    projection.fitSize([newWidth, newHeight], cities)

    svg
      .selectAll('.cities')
      .attr('d', path)
    svg
      .selectAll('.label')
      .attr('transform', d => `translate(${path.centroid(d)})`)

    svg
      .selectAll('.dam')
      .attr('transform', d => {
        let coords = projection([d.longitude, d.latitude])
        return `translate(${coords})rotate(-45)`
      })

    // If it's really small, resize the rect size
    if (newHeight < 400) {
      svg.selectAll('.dam').attr('width', 3).attr('height', 3)
    } else {
      svg.selectAll('.dam').attr('width', 8).attr('height', 8)
    }

    if (newWidth < 200) {
      svg.selectAll('.dam').attr('width', 3).attr('height', 3)
    } else {
      svg.selectAll('.dam').attr('width', 8).attr('height', 8)
    }
  }

  window.addEventListener('resize', debounce(render, 400))
  render()
}
