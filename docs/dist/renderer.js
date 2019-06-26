"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* global THREE */

/* global Stats */

/* global Solver */

/* global dat */

/* global options */
var solver;
var camera, scene, renderer, orbit;
var solution = {};
var geometry, material, mesh, sky, sunSphere, plot;
var stats;
var points = {
  names: ['A', 'B', 'C'],
  coordinates: ['x', 'y', 'z'],
  objects: [],
  labels: []
};

function initSky() {
  sky = new THREE.Sky();
  sky.scale.setScalar(options.skyScale);
  scene.add(sky);
  sunSphere = new THREE.Mesh(new THREE.SphereBufferGeometry(200, 16, 8), new THREE.MeshBasicMaterial({
    color: 0xffffff
  }));
  sunSphere.position.y = -10;
  sunSphere.visible = false;
  scene.add(sunSphere);
}

function guiChanged() {
  var distance = 40;
  var uniforms = sky.material.uniforms;
  uniforms.turbidity.value = options.turbidity;
  uniforms.rayleigh.value = options.rayleigh;
  uniforms.luminance.value = options.luminance;
  uniforms.mieCoefficient.value = options.mieCoefficient;
  uniforms.mieDirectionalG.value = options.mieDirectionalG;
  var theta = Math.PI * (options.inclination - 0.5);
  var phi = 2 * Math.PI * (options.azimuth - 0.5);
  sunSphere.position.x = distance * Math.cos(phi);
  sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
  sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
  uniforms.sunPosition.value.copy(sunSphere.position);
  solution.centerLabel.visible = options.label;
  points.label.visible = options.label;
  sky.visible = options.sky;
  plot.visible = options.plot;

  if (options.drawing) {
    solution.group.visible = solver.isOk;
  } else {
    solution.group.visible = false;
  }

  renderer.render(scene, camera);
}

function guiPointChanged() {
  var resetPreset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  for (var _i = 0, _Object$entries = Object.entries(points.names); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        index = _Object$entries$_i[0],
        name = _Object$entries$_i[1];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = points.coordinates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var coordinate = _step.value;
        points.objects[index].position[coordinate] = options[name + coordinate];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    points.labels[index].position.addVectors(points.objects[index].position, new THREE.Vector3(0, options.textSize * 0.5, 0));
  }

  if (resetPreset) {
    // Сбрасываем пресет, потому что введены кастомные значения координат
    options.preset = '';
  }

  solve();
}

function initSolution() {
  solution.group = new THREE.Group();
  solution.answer = new THREE.Group();
  solution.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1);
  solution.planeHelper = new THREE.PlaneHelper(solution.plane, 1, 0x44ff00); // solution.group.add(solution.planeHelper)

  for (var _i2 = 0, _arr2 = ['line1', 'line2', 'line3', 'line4']; _i2 < _arr2.length; _i2++) {
    var line = _arr2[_i2];

    var _material3 = new THREE.LineBasicMaterial({
      color: options[line + 'Color'],
      linewidth: options.linesWidth
    });

    var _geometry3 = new THREE.Geometry();

    _geometry3.vertices.push(new THREE.Vector3());

    _geometry3.vertices.push(new THREE.Vector3());

    solution[line] = new THREE.Line(_geometry3, _material3);
    solution.group.add(solution[line]);
  }

  {
    var _geometry = new THREE.SphereGeometry(options.pointsRadius, 32, 32);

    var _material = new THREE.MeshToonMaterial({
      color: options.centerColor
    });

    solution.center = new THREE.Mesh(_geometry, _material);
    solution.answer.add(solution.center);
  }
  {
    var _geometry2 = new THREE.TorusBufferGeometry(1, options.circleWidth, 16, 100);

    var _material2 = new THREE.MeshToonMaterial({
      color: options.circleColor
    });

    solution.circle = new THREE.Mesh(_geometry2, _material2);
    solution.answer.add(solution.circle);
    solution.centerLabel = createSprite('O');
    solution.answer.add(solution.centerLabel);
  }
  scene.add(solution.group);
  scene.add(solution.answer);
  solution.info = document.createElement('div');
  solution.info.className = 'info';
  document.body.appendChild(solution.info);
}

function formatPoint(name, point) {
  var x = point.x.toPrecision(options.precision);
  var y = point.y.toPrecision(options.precision);
  var z = point.z.toPrecision(options.precision);
  return "".concat(name, " (").concat(x, ", ").concat(y, ", ").concat(z, ")");
}

function solve() {
  solver.run(points.objects[0].position, points.objects[1].position, points.objects[2].position);
  solution.info.innerHTML = solver.status + '<br/>';

  for (var _i3 = 0, _Object$entries2 = Object.entries(points.names); _i3 < _Object$entries2.length; _i3++) {
    var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2),
        index = _Object$entries2$_i[0],
        name = _Object$entries2$_i[1];

    solution.info.innerHTML += '<br/>' + formatPoint(name, points.objects[index].position);
  }

  if (solver.isOk) {
    solution.info.innerHTML += '<br/><br/>' + formatPoint('O', solver.center) + '<br/>' + 'Радиус окружности: ' + solver.radius.toPrecision(options.precision);
  }

  solution.group.visible = solver.isOk && options.drawing;
  solution.answer.visible = solver.isOk;

  if (solver.isOk) {
    for (var _i4 = 0, _arr3 = ['line1', 'line2', 'line3', 'line4']; _i4 < _arr3.length; _i4++) {
      var line = _arr3[_i4];
      solution[line].geometry.vertices[0].copy(solver.nice(line).start);
      solution[line].geometry.vertices[1].copy(solver.nice(line).end);
      solution[line].geometry.verticesNeedUpdate = true;
    }

    solution.planeHelper.plane.copy(solver.plane);
    solution.center.position.copy(solver.center);
    solution.circle.position.copy(solver.center);
    var look = new THREE.Vector3();
    solution.circle.geometry = new THREE.TorusBufferGeometry(solver.radius, options.circleWidth, 16, 100);
    solution.circle.lookAt(look.addVectors(solver.center, solver.plane.normal));
    solution.centerLabel.position.addVectors(solution.center.position, new THREE.Vector3(0, options.textSize * 0.5, 0));
  } else {}
}

function guiPresetChanged() {
  var values = options.preset.split(',');
  options.Ax = parseFloat(values[0]);
  options.Ay = parseFloat(values[1]);
  options.Az = parseFloat(values[2]);
  options.Bx = parseFloat(values[3]);
  options.By = parseFloat(values[4]);
  options.Bz = parseFloat(values[5]);
  options.Cx = parseFloat(values[6]);
  options.Cy = parseFloat(values[7]);
  options.Cz = parseFloat(values[8]);
  guiPointChanged(false);
}

function initDatGui() {
  var gui = new dat.GUI();
  gui.add(options, 'sky').listen().onChange(guiChanged);
  gui.add(options, 'plot').listen().onChange(guiChanged);
  gui.add(options, 'drawing').listen().onChange(guiChanged);
  gui.add(options, 'label').listen().onChange(guiChanged);
  gui.add(options, 'preset', options.presets).listen().onChange(guiPresetChanged);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = points.names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var name = _step2.value;
      var point = gui.addFolder("Point ".concat(name));
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = points.coordinates[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var coordinate = _step3.value;
          point.add(options, name + coordinate, -options.plotSize * 0.5, options.plotSize * 0.5).step(0.01).listen().onChange(guiPointChanged);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function initPlot() {
  plot = new THREE.Group();
  var dirs = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  };
  var origin = new THREE.Vector3(0, 0, 0);

  for (var _i5 = 0, _Object$entries3 = Object.entries(dirs); _i5 < _Object$entries3.length; _i5++) {
    var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i5], 2),
        axis = _Object$entries3$_i[0],
        dir = _Object$entries3$_i[1];

    var arrow = new THREE.ArrowHelper(dir, origin, options.axisLength, options.axesColors[axis], 0.05, 0.04);
    arrow.line.material.linewidth = options.axisWidth;
    plot.add(arrow);
    plot.add(createSprite(axis, dir.multiplyScalar(options.axisLength + options.textSize * 0.5)));
  }

  plot.add(new THREE.GridHelper(options.plotSize, options.plotSize * options.plotGridDensity));
  scene.add(plot);
}

function initPoints() {
  points.label = new THREE.Group();
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = points.names[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var name = _step4.value;

      var _geometry4 = new THREE.SphereGeometry(options.pointsRadius, 32, 32);

      var _material4 = new THREE.MeshToonMaterial({
        color: options.pointsColor
      });

      var sphere = new THREE.Mesh(_geometry4, _material4);
      points.objects.push(sphere);
      scene.add(sphere);
      var sprite = createSprite(name);
      points.labels.push(sprite);
      points.label.add(sprite);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  scene.add(points.label);
}

function initLights() {
  scene.add(new THREE.AmbientLight(0xf0f0f0));
  var light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 150, 20);
  light.castShadow = true;
  light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
  light.shadow.bias = -0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);
}

function createSprite(text, position) {
  var sprite = new THREE.TextSprite({
    textSize: options.textSize,
    texture: {
      text: text,
      fontWeight: 'bold',
      fontFamily: 'Arial, Helvetica, sans-serif'
    },
    material: {
      color: options.textColor
    }
  });
  position = position || new THREE.Vector3();
  sprite.position.copy(position);
  return sprite;
}

function init() {
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  stats = new Stats();
  document.body.appendChild(stats.dom);
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, options.cameraNear, options.cameraFar);
  camera.position.set(options.cameraPosition.x, options.cameraPosition.y, options.cameraPosition.z);
  scene = new THREE.Scene();
  orbit = new THREE.OrbitControls(camera, renderer.domElement);
  orbit.minDistance = options.controlMinDistance;
  orbit.maxDistance = options.controlMaxDistance;
  initPlot();
  initPoints();
  initSky();
  initLights();
  initDatGui();
  initSolution();
  solver = new Solver();
  guiChanged();
  guiPointChanged();
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('keydown', onKeyDown, false);
}

function onWindowResize(e) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 68:
      // key 'd'
      options.drawing = !options.drawing;
      guiChanged();
      break;

    case 76:
      // key 'l'
      options.label = !options.label;
      guiChanged();
      break;

    case 83:
      // key 's'
      options.sky = !options.sky;
      guiChanged();
      break;

    case 80:
      // key 'p'
      options.plot = !options.plot;
      guiChanged();
      break;
  }
}

function render() {
  window.requestAnimationFrame(render);
  orbit.update();
  stats.update();
  renderer.render(scene, camera);
}

init();
render();
