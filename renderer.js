// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

let THREE = require('three')
let OrbitControls = require('three-orbit-controls')(THREE)

let camera, scene, renderer, controls
let geometry, material, mesh

init()
animate()

function init () {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)
  camera.position.x = 1
  camera.position.y = 0.5
  camera.position.z = 0.5

  scene = new THREE.Scene()
  controls = new OrbitControls(camera)

  geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
  material = new THREE.MeshNormalMaterial()
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  scene.add(new THREE.GridHelper(10, 100))

  let axes = new THREE.AxesHelper(5)

  axes.material.linewidth = 2
  scene.add(axes)

  controls.update()
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
}

function animate () {
  window.requestAnimationFrame(animate)

  // mesh.rotation.x += 0.01
  mesh.rotation.y += 0.005

  controls.update()
  renderer.render(scene, camera)
}

window.addEventListener('resize', function (e) {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
