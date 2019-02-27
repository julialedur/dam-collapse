import * as d3 from 'd3'
import * as topojson from 'topojson'

(function () {
  var width = 1000
  var height = 800

  var canvas = d3.select('#graphic')
    .append('canvas')
    .attr('width', width)
    .attr('height', height)

  var context = canvas.node().getContext('2d')

  var projection = d3.geoMercator()
    .scale(1000)
    .translate([width / 2, height / 2])

  var path = d3.geoPath()
    .projection(projection)

  // You'll need to georeference the top left and bottom right of each image
  // [ -108.816666669949,   24.1916666628633] is top left
  // [ -19.8556513797124, -58.85] is bottom right

  const layers = [
    {
      'name': 'southamerica-farther',
      'filePath': require('./images/zoom-big.png'),
      'cornerCoords': [[ -85.419276845, 10.427299400 ], [ -33.088919943, -56.482344413 ]]
    },
    {
      'name': 'southamerica-closer',
      'filePath': require('./images/zoom1.jpg'),
      'cornerCoords': [[ -67.690175002, -2.607662630 ], [ -30.146320264, -25.282335442 ]]
    },
    {
      'name': 'lake',
      'filePath': require('./images/minas.jpg'),
      'cornerCoords': [[ -51.239915636, -13.157095254 ], [ -36.210378853, -24.492786005 ]]
    },
    {
      'name': 'lake-closer',
      'filePath': require('./images/zoom3.jpg'),
      'cornerCoords': [[ -44.512003310, -19.936271219 ], [ -43.848537952, -20.338210921 ]]
    },
    {
      'name': 'dam-closer',
      'filePath': require('./images/zoom-dam.png'),
      'cornerCoords': [[ -44.156604367, -20.103413442 ], [ -44.078279550, -20.144902001 ]]
    },
    {
      'name': 'dam',
      'filePath': require('./images/zoom4.jpg'),
      'cornerCoords': [[ -44.129230197, -20.115610284 ], [ -44.1138004803, -20.124825773 ]]
    }
  ]

  const labelText = [{
    'text': 'Atlantic<br/>Ocean',
    'class': 'ocean',
    'align': 'center',
    'loc': '[-39.765809, -36.165509]',
    'rotation': '90',
    'visibleAt': 'all'
  }, {
    'text': 'Pacific<br/>Ocean',
    'class': 'ocean',
    'align': 'center',
    'loc': '[-90.901743, -25.263708]',
    'rotation': '',
    'visibleAt': 'all'
  }, {
    'text': 'Brazil',
    'class': 'country',
    'align': 'center',
    'loc': '[-46.300951, -11.702088]',
    'rotation': '',
    'visibleAt': 'all'
  }, {
    'text': 'Bolivia',
    'class': 'country',
    'align': 'center',
    'loc': '[-63.130348, -16.786675]',
    'rotation': '',
    'visibleAt': 'all'
  }, {
    'text': 'Argentina',
    'class': 'country',
    'align': 'center',
    'loc': '[-64.356433, -36.198828]',
    'rotation': '',
    'visibleAt': 'one'

  }, {
    'text': 'Argentina',
    'class': 'country',
    'align': 'center',
    'loc': '[-62.828638, -25.238391]',
    'rotation': '',
    'visibleAt': 'two'
  }, {
    'text': 'Venezuela',
    'class': 'country',
    'align': 'center',
    'loc': '[-67.661761, 8.527366]',
    'rotation': '',
    'visibleAt': 'all'
  }, {
    'text': 'Chile',
    'class': 'oceancountry',
    'align': 'right',
    'loc': '[-72.087902, -26.494552]',
    'rotation': '',
    'visibleAt': 'one'
  }, {
    'text': 'Chile',
    'class': 'country',
    'align': 'right',
    'loc': '[-68.849445, -23.236899]',
    'rotation': '',
    'visibleAt': 'two'
  }, {
    'text': 'Peru',
    'class': 'oceancountry',
    'align': 'right',
    'loc': '[-78.298777, -12.611913]',
    'rotation': '',
    'visibleAt': 'one'
  }, {
    'text': 'Peru',
    'class': 'country',
    'align': 'right',
    'loc': '[-71.449656, -15.115091]',
    'rotation': '',
    'visibleAt': 'two'
  }, {
    'text': 'Ecuador',
    'class': 'oceancountry',
    'align': 'right',
    'loc': '[-81.582688, -0.578808]',
    'rotation': '',
    'visibleAt': 'all'

  }, {
    'text': 'Colombia',
    'class': 'oceancountry',
    'align': 'right',
    'loc': '[-78.013219, 4.556407]',
    'rotation': '',
    'visibleAt': 'all'

  }, {
    'text': 'Lake extent as of<br/><span class="g-lakeyear"></span>',
    'class': 'extent',
    'align': 'left',
    'loc': '[-67.01387, -18.606799]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Lake Poopó',
    'class': 'lake-zoomedout',
    'align': 'left',
    'loc': '[-66.707853, -18.765067]',
    'rotation': '',
    'visibleAt': 'one, two'
  }, {
    'text': 'Lake Poopó',
    'class': 'lake',
    'align': 'center',
    'loc': '[-66.961898, -19.016301]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Bolivian Altiplano<br/><span class="height">12,100 ft. above sea level</span>',
    'class': 'physical',
    'align': 'center',
    'loc': '[-67.5497, -18.9547]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Salar de Uyuni',
    'class': 'physical',
    'align': 'center',
    'loc': '[-67.481563, -20.182323] ',
    'rotation': '',
    'visibleAt': 'three, four, five, six'
  }, {
    'text': 'Salar de Coipasa',
    'class': 'physical',
    'align': 'center',
    'loc': '[-68.133164, -19.453142]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Cordillera Central',
    'class': 'physical',
    'align': 'center',
    'loc': '[-65.839259, -18.44057]',
    'rotation': '',
    'visibleAt': 'three, four, five, six'
  }, {
    'text': 'Nevado Sajama<br/><span class="height">21,463 ft.</span>',
    'class': 'mountain',
    'align': 'left',
    'loc': '[-68.885267, -18.116359]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Cerro Carabaya<br/><span class="height">19,255 ft.</span',
    'class': 'mountain',
    'align': 'left',
    'loc': '[-68.695109, -19.147062]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Cochabamba',
    'class': 'city-nodot',
    'align': 'right',
    'loc': '[-66.185463, -17.383095]',
    'rotation': '',
    'visibleAt': 'three, four, five, six'
  }, {
    'text': 'Oruro',
    'class': 'city-nodot',
    'align': 'left',
    'loc': '[-67.071482, -17.951975]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'Huachacalla',
    'class': 'city-nodot',
    'align': 'left',
    'loc': '[-68.238822, -18.806686]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }, {
    'text': 'La Paz',
    'class': 'city-dot',
    'align': 'right',
    'loc': '[-68.273065, -16.50256]',
    'rotation': '',
    'visibleAt': 'two, three, four, five, six'
  }, {
    'text': '<blank>',
    'class': 'scalebar',
    'align': 'center',
    'loc': '[-66.961898, -19.226301]',
    'rotation': '',
    'visibleAt': 'four, five, six'
  }]
  const waypoints = [
    {
      slug: 'zero',
      zoom: 12.9,
      mobilezoom: 12.9,
      focus: [-44.19972, -20.14333],
      visibleLayers: ['southamerica-farther']
    },
    {
      slug: 'one',
      zoom: 12.9,
      mobilezoom: 12.9,
      focus: [-44.19972, -20.14333],
      visibleLayers: ['southamerica-farther']
    },
    {
      slug: 'two',
      zoom: 13.5,
      mobilezoom: 13.5,
      focus: [-44.19972, -20.14333],
      visibleLayers: ['southamerica-farther', 'southamerica-closer']
    },
    {
      slug: 'three',
      zoom: 16,
      mobilezoom: 17.0,
      focus: [-44.19972, -20.14333],
      visibleLayers: ['southamerica-farther', 'southamerica-closer', 'lake']
    },
    {
      slug: 'four',
      zoom: 18,
      mobilezoom: 18.0,
      focus: [ -44.121389, -20.119722 ],
      visibleLayers: ['southamerica-closer', 'lake', 'lake-closer']
    },
    {
      slug: 'five',
      zoom: 18,
      mobilezoom: 18.1,
      focus: [ -44.121389, -20.119722 ],
      visibleLayers: ['lake', 'lake-closer']
    },
    {
      slug: 'six',
      zoom: 22,
      mobilezoom:22,
      focus: [ -44.121389, -20.119722 ],
      visibleLayers: ['lake', 'lake-closer']
    },
    {
      slug: 'seven',
      zoom: 23,
      mobilezoom: 23,
      focus: [ -44.121389, -20.119722 ],
      visibleLayers: ['lake-closer', 'dam-closer']
    },
    {
      slug: 'eight',
      zoom: 25,
      mobilezoom: 25,
      focus: [ -44.121389, -20.119722 ],
      visibleLayers: ['dam-closer', 'dam']
    }
  ]

  let loadImages = Promise.all(
    layers.map(d => {
      return new Promise((resolve, reject) => {
        var image = new Image()
        image.onload = function () {
          d.imageObj = image
          d.height = image.height
          d.width = image.width
          resolve()
        }
        image.src = d.filePath
      })
    })
  )

  loadImages.then(ready)

  function ready () {
    labelText.forEach(d => {
      d.coords = eval(d.loc)
    })

    let labelHolder = d3.select(canvas.node().parentNode)
      .style('position', 'relative')
      .append('div')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('height', height + 'px')
      .style('width', width + 'px')
      .style('overflow', 'hidden')
      .attr('class', 'label-holder')

    let labels = labelHolder
      .selectAll('div')
      .data(labelText)
      .enter().append('div')
      .style('transform', d => {
        if (d.rotation) {
          return 'rotate(' + d.rotation + 'deg)'
        }
      })
      .html(d => d.text)
      .attr('class', d => {
        let layerClasses = d.visibleAt.split(', ').map(d => 'label-for-' + d).join(' ')
        return ['map-label', d.class, layerClasses].join(' ')
      })
      .style('position', 'absolute')
      .style('text-align', d => d.align)

    function positionLabels () {
      labels.style('top', d => projection(d.coords)[1] + 'px')
        .style('left', d => projection(d.coords)[0] + 'px')
    }

    function drawWaypoint (slug, progress = 1) {
      currentWaypointSlug = slug
      let index = waypoints.findIndex(d => d.slug === slug)
      let waypoint0 = waypoints[index]
      let waypoint1 = waypoints[index + 1]

      if (!waypoint1) {
        waypoint1 = waypoint0
        progress = 1
      }

      let zoom = d3.interpolateNumber(waypoint0.zoom, waypoint1.zoom)(d3.easeQuad(progress))
      let focus = [
        d3.interpolateNumber(waypoint0.focus[0], waypoint1.focus[0])(progress),
        d3.interpolateNumber(waypoint0.focus[1], waypoint1.focus[1])(progress)
      ]

      let d3zoom = Math.pow(2, zoom) / 2 / Math.PI
      projection
        .center(focus)
        .scale(d3zoom)

      // Make everything the ocean in case they zoom out a lot
      context.fillStyle = '#284f70'
      context.fillRect(0, 0, canvas.attr('width'), canvas.attr('height'))

      layers.forEach(layer => {
        if (waypoint0.visibleLayers.indexOf(layer.name) !== -1) {
          context.globalAlpha = 1
          drawLayer(layer)
        } else if (waypoint1.visibleLayers.indexOf(layer.name) !== -1) {
          context.globalAlpha = 1
          drawLayer(layer)
        }
      })

      d3.selectAll('.map-label')
        .style('opacity', 0)

      d3.selectAll('.label-for-' + waypoint0.slug)
        .style('opacity', 1 - progress)

      d3.selectAll('.label-for-' + waypoint1.slug)
        .style('opacity', progress)

      d3.selectAll('.label-for-' + waypoint0.slug + '.label-for-' + waypoint1.slug)
        .style('opacity', 1)

      d3.selectAll('.label-for-all')
        .style('opacity', 1)

      positionLabels()
    }

    function drawLayer (layer) {
      var screenCoords = [ projection(layer.cornerCoords[0]), projection(layer.cornerCoords[1]) ]

      var topLeft = screenCoords[0]

      var bottomRight = screenCoords[1]

      var imageWidth = bottomRight[0] - topLeft[0]

      var imageHeight = bottomRight[1] - topLeft[1]

      context.drawImage(layer.imageObj, topLeft[0], topLeft[1], imageWidth, imageHeight)
    }

    let currentWaypointSlug = waypoints[0].slug

    d3.select('#step-1').on('progress', function () {
      console.log('Into step 1')
      drawWaypoint('zero', d3.event.detail.progress)
    })

    d3.select('#step-2').on('progress', function () {
      console.log('Into step 2')
      drawWaypoint('one', d3.event.detail.progress)
    })

    d3.select('#step-3').on('progress', function () {
      console.log('Into step 3')
      drawWaypoint('two', d3.event.detail.progress)
    })

    d3.select('#step-4').on('progress', function () {
      drawWaypoint('three', d3.event.detail.progress)
    })

    d3.select('#step-5').on('progress', function () {
      drawWaypoint('four', d3.event.detail.progress)
    })

    d3.select('#step-6').on('progress', function () {
      drawWaypoint('five', d3.event.detail.progress)
    })

    d3.select('#step-7').on('progress', function () {
      drawWaypoint('six', d3.event.detail.progress)
    })
    d3.select('#step-8').on('progress', function () {
      drawWaypoint('seven', d3.event.detail.progress)
    })
    d3.select('#step-9').on('progress', function () {
      drawWaypoint('eight', d3.event.detail.progress)
    })

    function render () {
      // Calculate height/width
      let screenWidth = canvas.node().parentNode.offsetWidth
      let screenHeight = window.innerHeight

      projection.translate([screenWidth / 2, screenHeight / 2])

      canvas
        .attr('height', screenHeight)
        .attr('width', screenWidth)

      labelHolder
        .style('height', screenHeight + 'px')
        .style('width', screenWidth + 'px')

      drawWaypoint(currentWaypointSlug, 1)
      window.scrollTo(window.scrollX, window.scrollY)
    }

    window.addEventListener('resize', render)
    render()
  }
})()
