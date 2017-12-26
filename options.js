/* eslint no-unused-vars: "off" */

// https://www.canva.com/learn/100-color-combinations/

let options = {

  turbidity: 10,
  rayleigh: 2,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  luminance: 1,
  inclination: 0.49, // elevation / inclination
  azimuth: 0.25, // Facing front,

  label: true,

  precision: 2,

  preset: '',

  presets: {
    InLine: '0,0,0,0.1,0,0,-0.1,0,0',
    Other: '1,0,0,0,0,0,0,0,1'
  },

  sky: true,
  skyScale: 40,

  // cameraPosition: {
  //   x: 0.9494695250202605,
  //   y: 0.5510547620127447,
  //   z: 0.5429974864774902
  // },

  textSize: 0.1,
  textColor: 0xffffff,

  cameraPosition: {
    x: 0.9468279641211484,
    y: 0.6555164882419569,
    z: 0.41691118958494094
  },

  // Camera frustum near plane
  cameraNear: 0.01,

  // Camera frustum far plane
  cameraFar: 100,

  controlMinDistance: 0.2,
  controlMaxDistance: 4.9,

  /**
    * Настройки визуализации задачи
    */

  drawing: true,

  // Радиус точек исходных
  pointsRadius: 0.01,
  pointsColor: 0xffff00,

  // Увеличение длины прямых
  linesEnlargeLength: 0.1,
  linesWidth: 5,
  line1Color: 0x217ca3,
  line3Color: 0x217ca3,
  line2Color: 0xfaaf08,
  line4Color: 0xfaaf08,
  centerColor: 0xf34a4a,
  circleWidth: 0.005,
  circleColor: 0xf34a4a,

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

  Ax: 0.4,
  Ay: 0.1,
  Az: 0.1,

  Bx: -0.4,
  By: 0.1,
  Bz: 0.1,

  Cx: 0.1,
  Cy: 0.4,
  Cz: -0.646
}
