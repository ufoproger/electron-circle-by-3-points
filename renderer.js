const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)

let camera, scene, renderer, controls
let geometry, material, mesh

init()
animate()

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

function init () {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)
  camera.position.copy(new THREE.Vector3(1, 0.5, 0.5))

  scene = new THREE.Scene()
  controls = new OrbitControls(camera)

  geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
  material = new THREE.MeshNormalMaterial()
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  scene.add(new THREE.GridHelper(4, 4 * 10))

  let axes = new THREE.AxesHelper(5)

  axes.material.linewidth = 2
  scene.add(axes)

  addLine()

  controls.update()
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
}

function animate () {
  window.requestAnimationFrame(animate)

  mesh.rotation.x += 0.01
  mesh.rotation.y += 0.005
  controls.update()
  renderer.render(scene, camera)
}

window.addEventListener('resize', function (e) {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
