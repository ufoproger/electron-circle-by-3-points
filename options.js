/* eslint no-unused-vars: "off" */

let options = {

  turbidity: 10,
  rayleigh: 2,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  luminance: 1,
  inclination: 0.49, // elevation / inclination
  azimuth: 0.25, // Facing front,

  sky: !true,

  // Camera frustum near plane
  cameraNear: 0.01,

  // Camera frustum far plane
  cameraFar: 100,

  controlMinDistance: 0.2,
  controlMaxDistance: 4.9,

  /**
    * Настройки визуализации задачи
    */

  // Радиус точек исходных
  pointsRadius: 0.01,

  /**
    * Настройки графика: оси координат, координатная сетка
    */

  // Отображать график
  plot: true,

  // Размер сетки
  plotSize: 4,

  // Плотность сетки (количество разбиений на единицу длины)
  plotGridDensity: 10,

  // Цвета осей координат
  axesColors: {
    x: 0xff0000,
    y: 0x00ff00,
    z: 0x0000ff
  },

  // Ширина оси координат
  axisWidth: 3,

  // Длина оси координат
  axisLength: 2,

  reset: function () {
    console.log('reset')
  },

  Ax: 0.4,
  Ay: 0,
  Az: 0,

  Bx: -0.4,
  By: 0,
  Bz: 0,

  Cx: 0,
  Cy: 0.4,
  Cz: 0
}
