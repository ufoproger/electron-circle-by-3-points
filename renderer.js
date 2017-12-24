/* global THREE */
/* global Stats */
/* global dat */
/* global options */

let camera, scene, renderer, orbit
let geometry, material, mesh, sky, sunSphere, plot
let stats
let points = {
  names: ['A', 'B', 'C'],
  coordinates: ['x', 'y', 'z'],
  objects: []
}

function guiChanged () {
  let distance = 40

  var uniforms = sky.material.uniforms
  uniforms.turbidity.value = options.turbidity
  uniforms.rayleigh.value = options.rayleigh
  uniforms.luminance.value = options.luminance
  uniforms.mieCoefficient.value = options.mieCoefficient
  uniforms.mieDirectionalG.value = options.mieDirectionalG
  var theta = Math.PI * (options.inclination - 0.5)
  var phi = 2 * Math.PI * (options.azimuth - 0.5)
  sunSphere.position.x = distance * Math.cos(phi)
  sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta)
  sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta)
  uniforms.sunPosition.value.copy(sunSphere.position)

  sky.visible = options.sky
  plot.visible = options.plot

  for (const [index, name] of Object.entries(points.names)) {
    for (const coordinate of points.coordinates) {
      points.objects[index].position[coordinate] = options[name + coordinate]
    }
  }

  renderer.render(scene, camera)
}

function initSky () {
  sky = new THREE.Sky()
  sky.scale.setScalar(450)
  scene.add(sky)

  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(20000, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )

  sunSphere.position.y = -70
  sunSphere.visible = false
  scene.add(sunSphere)
}

function initDatGui () {
  let gui = new dat.GUI()

  // gui.add(options, 'turbidity', 1.0, 20.0, 0.1).onChange(guiChanged)
  // gui.add(options, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged)
  // gui.add(options, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged)
  // gui.add(options, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged)
  // gui.add(options, 'luminance', 0.0, 2).onChange(guiChanged)
  // gui.add(options, 'inclination', 0, 1, 0.0001).onChange(guiChanged)
  // gui.add(options, 'azimuth', 0, 1, 0.0001).onChange(guiChanged)
  gui.add(options, 'sky').onChange(guiChanged)
  gui.add(options, 'plot').onChange(guiChanged)
  // gui.add(options, 'reset').onChange(guiChanged)

  for (let name of points.names) {
    let point = gui.addFolder(`Point ${name}`)

    for (let coordinate of points.coordinates) {
      point.add(options, name + coordinate, -10, 10).step(0.001).onChange(guiChanged)
    }
  }
}

function addLine () {
  let material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    linewidth: 3
  })

  let geometry = new THREE.Geometry()

  geometry.vertices.push(new THREE.Vector3(-0.2, 0, 0))
  geometry.vertices.push(new THREE.Vector3(0, 0.5, 0))
  geometry.vertices.push(new THREE.Vector3(0.4, 0, 0))

  let line = new THREE.Line(geometry, material)

  scene.add(line)
}

init()
render()

function initPlot () {
  plot = new THREE.Group()

  const dirs = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  }

  const origin = new THREE.Vector3(0, 0, 0)

  for (const [axis, dir] of Object.entries(dirs)) {
    let arrow = new THREE.ArrowHelper(
      dir,
      origin,
      options.axisLength,
      options.axesColors[axis],
      0.05,
      0.04
    )

    arrow.line.material.linewidth = options.axisWidth
    plot.add(arrow)
  }

  plot.add(
    new THREE.GridHelper(
      options.plotSize,
      options.plotSize * options.plotGridDensity
    )
  )

  scene.add(plot)
}

function initPoints () {
  for (const name of points.names) {
    let geometry = new THREE.SphereGeometry(options.pointsRadius, 32, 32)
    let material = new THREE.MeshBasicMaterial({color: 0xffff00})
    let sphere = new THREE.Mesh(geometry, material)

    points.objects.push(sphere)
    scene.add(sphere)
  }
}

function initLights () {
  var lights = []
  lights[ 0 ] = new THREE.PointLight(0xffffff, 1, 0)
  lights[ 1 ] = new THREE.PointLight(0xffffff, 1, 0)
  lights[ 2 ] = new THREE.PointLight(0xffffff, 1, 0)

  lights[ 0 ].position.set(0, 5, 0)
  lights[ 1 ].position.set(2, 5, 2)
  lights[ 2 ].position.set(-2, -5, -2)

  scene.add(lights[ 0 ])
  scene.add(lights[ 1 ])
  scene.add(lights[ 2 ])
}

function init () {
  renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  stats = new Stats()
  document.body.appendChild(stats.dom)

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    options.cameraNear,
    options.cameraFar
  )

  camera.position.set(1, 0.5, 0.5)

  scene = new THREE.Scene()

  orbit = new THREE.OrbitControls(camera, renderer.domElement)
  orbit.minDistance = options.controlMinDistance
  orbit.maxDistance = options.controlMaxDistance

  initPlot()
  initPoints()
  initSky()
  initDatGui()

  guiChanged()

  window.addEventListener('resize', onWindowResize, false)
  document.addEventListener('keydown', onKeyDown, false)
}

function onWindowResize (e) {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
//
function onKeyDown (event) {
//   switch (event.keyCode) {
//     case 83: // key 's'
//       options.sky = !options.sky
//       guiChanged()
//       // sky.visible = !sky.visible
//       break
//
//     case 80: // key 'p'
//       options.plot = !options.initPlot
//       guiChanged()
//       // plot.visible = !plot.visible
//       break
//
//     default:
//       console.log(`keyCode = ${event.keyCode}`)
//           //
// 					// case 72: // h
//           //
// 					// hemiLight.visible = !hemiLight.visible;
// 					// hemiLightHelper.visible = !hemiLightHelper.visible;
// 					// break;
//           //
// 					// case 68: // d
//           //
// 					// dirLight.visible = !dirLight.visible;
// 					// dirLightHeper.visible = !dirLightHeper.visible;
// 					// break;
//
//   }
}

function render () {
  window.requestAnimationFrame(render)
  orbit.update()
  stats.update()
  renderer.render(scene, camera)
}
