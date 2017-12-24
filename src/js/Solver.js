/* global THREE */

class Solver {
  constructor () {
    this._status = null
    this._current = {}

    this.clear()
  }

  static get STATUSES () {
    return {
      none: 'Задача ещё не решалась',
      collinear: 'Точка расположены на одной прямой',
      ok: 'Окружность построена'

    }
  }

  static testPoints (a, b, c) {
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    let v = v1.subVectors(c, b).cross(v2.subVectors(a, b))

    return (v.lengthSq() > Number.EPSILON)
  }

  get status () {
    return this._status
  }

  get plane () {
    let plane = new THREE.Plane(
      this._current.a,
      this._current.b,
      this._current.c
    )

    return plane.copy()
  }

  get line1 () {
    let line = new THREE.Line3(
      this._current.a,
      this._current.b
    )

    return line
  }

  get line2 () {
    let line = new THREE.Line3(
      this._current.b,
      this._current.c
    )

    return line;
  }

  clear () {
    this._status = Solver.STATUSES.none
  }

  run (a, b, c) {
    this._current = {a, b, c}

    // Проверка точек на то, можно и из них попытаться слепить окружность
    if (!Solver.testPoints(a, b, c)) {
      this._status = Solver.STATUSES.collinear

      console.log('Collinear')
      return false
    }
  }
}

module.exports = Solver
