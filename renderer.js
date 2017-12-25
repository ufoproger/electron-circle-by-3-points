/* global THREE */
/* global Stats */
/* global Solver */
/* global dat */
/* global options */

let solver
let camera, scene, renderer, orbit
let solution = {}
let geometry, material, mesh, sky, sunSphere, plot
let stats
let points = {
  names: ['A', 'B', 'C'],
  coordinates: ['x', 'y', 'z'],
  objects: [],
  labels: []
}

function initSky () {
  sky = new THREE.Sky()
  sky.scale.setScalar(options.skyScale)
  scene.add(sky)

  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(200, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )

  sunSphere.position.y = -10
  sunSphere.visible = false
  scene.add(sunSphere)
}

function guiChanged () {
  let distance = 40

  let uniforms = sky.material.uniforms
  uniforms.turbidity.value = options.turbidity
  uniforms.rayleigh.value = options.rayleigh
  uniforms.luminance.value = options.luminance
  uniforms.mieCoefficient.value = options.mieCoefficient
  uniforms.mieDirectionalG.value = options.mieDirectionalG

  let theta = Math.PI * (options.inclination - 0.5)
  let phi = 2 * Math.PI * (options.azimuth - 0.5)

  sunSphere.position.x = distance * Math.cos(phi)
  sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta)
  sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta)
  uniforms.sunPosition.value.copy(sunSphere.position)

  solution.centerLabel.visible = options.label
  points.label.visible = options.label
  sky.visible = options.sky
  plot.visible = options.plot

  if (options.drawing) {
    solution.group.visible = solver.isOk
  } else {
    solution.group.visible = false
  }

  renderer.render(scene, camera)
}

function guiPointChanged (resetPreset = true) {
  for (const [index, name] of Object.entries(points.names)) {
    for (const coordinate of points.coordinates) {
      points.objects[index].position[coordinate] = options[name + coordinate]
    }

    points.labels[index].position.addVectors(points.objects[index].position, new THREE.Vector3(0, options.textSize * 0.5, 0))
  }

  if (resetPreset) {
    // Сбрасываем пресет, потому что введены кастомные значения координат
    options.preset = ''
  }

  solve()
}

function initSolution () {
  solution.group = new THREE.Group()
  solution.answer = new THREE.Group()

  solution.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1)
  solution.planeHelper = new THREE.PlaneHelper(solution.plane, 1, 0x44ff00)
  // solution.group.add(solution.planeHelper)

  for (const line of ['line1', 'line2', 'line3', 'line4']) {
    let material = new THREE.LineBasicMaterial({
      color: options[line + 'Color'],
      linewidth: options.linesWidth
    })

    let geometry = new THREE.Geometry()

    geometry.vertices.push(new THREE.Vector3())
    geometry.vertices.push(new THREE.Vector3())

    solution[line] = new THREE.Line(geometry, material)

    solution.group.add(solution[line])
  }

  {
    let geometry = new THREE.SphereGeometry(options.pointsRadius, 32, 32)
    let material = new THREE.MeshToonMaterial({color: options.centerColor})

    solution.center = new THREE.Mesh(geometry, material)
    solution.answer.add(solution.center)
  }

  {
    let geometry = new THREE.TorusBufferGeometry(1, options.circleWidth, 16, 100)
    let material = new THREE.MeshToonMaterial({ color: options.circleColor })

    solution.circle = new THREE.Mesh(geometry, material)
    solution.answer.add(solution.circle)

    solution.centerLabel = createSprite('O')
    solution.answer.add(solution.centerLabel)
  }

  scene.add(solution.group)
  scene.add(solution.answer)
}

function solve () {
  solver.run(points.objects[0].position, points.objects[1].position, points.objects[2].position)

  console.log(solver.status)

  if (solver.isOk) {
    console.log('Найден центр окружности в точке (' + solver.center.toArray() + '), радиус ' + solver.radius)
  }

  solution.group.visible = (solver.isOk && options.drawing)
  solution.answer.visible = solver.isOk

  if (solver.isOk) {
    for (const line of ['line1', 'line2', 'line3', 'line4']) {
      solution[line].geometry.vertices[0].copy(solver[line].start)
      solution[line].geometry.vertices[1].copy(solver[line].end)
      solution[line].geometry.verticesNeedUpdate = true
    }

    solution.planeHelper.plane.copy(solver.plane)
    solution.center.position.copy(solver.center)
    solution.circle.position.copy(solver.center)

    let look = new THREE.Vector3()

    solution.circle.geometry = new THREE.TorusBufferGeometry(solver.radius, options.circleWidth, 16, 100)
    solution.circle.lookAt(look.addVectors(solver.center, solver.plane.normal))

    solution.centerLabel.position.addVectors(solution.center.position, new THREE.Vector3(0, options.textSize * 0.5, 0))
  } else {

  }
}

function guiPresetChanged () {
  let values = options.preset.split(',')

  options.Ax = parseFloat(values[0])
  options.Ay = parseFloat(values[1])
  options.Az = parseFloat(values[2])
  options.Bx = parseFloat(values[3])
  options.By = parseFloat(values[4])
  options.Bz = parseFloat(values[5])
  options.Cx = parseFloat(values[6])
  options.Cy = parseFloat(values[7])
  options.Cz = parseFloat(values[8])

  guiPointChanged(false)
}

function initDatGui () {
  let gui = new dat.GUI()

  gui.add(options, 'sky').listen().onChange(guiChanged)
  gui.add(options, 'plot').listen().onChange(guiChanged)
  gui.add(options, 'drawing').listen().onChange(guiChanged)
  gui.add(options, 'label').listen().onChange(guiChanged)

  gui.add(options, 'preset', options.presets).listen().onChange(guiPresetChanged)

  for (let name of points.names) {
    let point = gui.addFolder(`Point ${name}`)

    for (let coordinate of points.coordinates) {
      point
        .add(options, name + coordinate, -options.plotSize * 0.5, options.plotSize * 0.5)
        .step(0.01)
        .listen()
        .onChange(guiPointChanged)
    }
  }
}

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
    plot.add(
      createSprite(
        axis,
        dir.multiplyScalar(options.axisLength + options.textSize * 0.5)
      )
    )
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
  points.label = new THREE.Group()

  for (const name of points.names) {
    let geometry = new THREE.SphereGeometry(options.pointsRadius, 32, 32)
    let material = new THREE.MeshToonMaterial({color: options.pointsColor})
    let sphere = new THREE.Mesh(geometry, material)

    points.objects.push(sphere)
    scene.add(sphere)

    let sprite = createSprite(name)
    points.labels.push(sprite)
    points.label.add(sprite)
  }

  scene.add(points.label)
}

function initLights () {
  scene.add(new THREE.AmbientLight(0xf0f0f0))

  let light = new THREE.SpotLight(0xffffff, 1.5)

  light.position.set(0, 1500, 200)
  light.castShadow = true
  light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000))
  light.shadow.bias = -0.000222
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024

  scene.add(light)
}

function createSprite (text, position) {
  let sprite = new THREE.TextSprite({
    textSize: options.textSize,
    texture: {
      text,
      fontWeight: 'bold',
      fontFamily: 'Arial, Helvetica, sans-serif'
    },
    material: {
      color: options.textColor
    }
  })

  position = position || new THREE.Vector3()

  sprite.position.copy(position)
  return sprite
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

  camera.position.set(
    options.cameraPosition.x,
    options.cameraPosition.y,
    options.cameraPosition.z
  )

  scene = new THREE.Scene()

  orbit = new THREE.OrbitControls(camera, renderer.domElement)
  orbit.minDistance = options.controlMinDistance
  orbit.maxDistance = options.controlMaxDistance

  initPlot()
  initPoints()
  initSky()
  initLights()
  initDatGui()
  initSolution()

  solver = new Solver()

  guiChanged()
  guiPointChanged()

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
  switch (event.keyCode) {
    case 68: // key 'd'
      options.drawing = !options.drawing
      guiChanged()
      break

    case 76: // key 'l'
      options.label = !options.label
      guiChanged()
      break

    case 83: // key 's'
      options.sky = !options.sky
      guiChanged()
      break

    case 80: // key 'p'
      options.plot = !options.plot
      guiChanged()
      break

    // default:
    //   console.log(`keyCode = ${event.keyCode}`)
  }
}

function render () {
  window.requestAnimationFrame(render)
  orbit.update()
  stats.update()
  renderer.render(scene, camera)
}

init()
render()
