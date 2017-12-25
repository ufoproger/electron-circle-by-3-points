/* global THREE */
/* global options */

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

  static line (l) {
    return l
  }

  static lineMiddlePerpendicular (line, normal) {
    let center = line.getCenter()
    let delta = line.delta().cross(normal)

    let result = new THREE.Line3()

    result.start.subVectors(center, delta)
    result.end.addVectors(center, delta)

    return result
  }

  get status () {
    return this._status
  }

  get plane () {
    let plane = new THREE.Plane()

    plane.setFromCoplanarPoints(
      this._current.a,
      this._current.b,
      this._current.c
    )

    return plane
  }

  get line1 () {
    let line = new THREE.Line3(
      this._current.a,
      this._current.b
    )

    return Solver.line(line)
  }

  get line2 () {
    let l = Solver.lineMiddlePerpendicular(this.line1, this.plane.normal)

    console.log(l)

    return l

    let line = new THREE.Line3(
      this._current.b,
      this._current.c
    )

    return Solver.line(line)
  }

  // Серединный перпендикул line1
  get line3 () {

  }

  get isOk () {
    return (this.status === Solver.STATUSES.ok)
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

    this._status = Solver.STATUSES.ok
  }
}

module.exports = Solver
