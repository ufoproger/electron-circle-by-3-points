/* global THREE */
/* global options */

class Solver {
  constructor () {
    this._status = null
    this._current = {}

    this.clear()
  }

  static get EPSILON () {
    return 1e-5
  }

  static get STATUSES () {
    return {
      none: 'Задача ещё не решалась',
      collinear: 'Точки расположены на одной прямой',
      ok: 'Окружность построена',
      noCenter: 'Не удалось найти центр окружности',
      badCenter: 'Расстояния от центра окружности до точек на ней не совпадают'
    }
  }

  static testPoints (a, b, c) {
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    let v = v1.subVectors(c, b).cross(v2.subVectors(a, b))

    return (v.lengthSq() > Solver.EPSILON)
  }

  static line (l) {
    return Solver.lineEnlarge(l, options.plotSize)
  }

  static niceLine (l) {
    return Solver.lineEnlarge(l, options.linesEnlargeLength)
  }

  static lineEnlarge (line, length) {
    let delta = line.delta().normalize().multiplyScalar(length)
    let result = new THREE.Line3()

    result.copy(line)
    result.start.sub(delta)
    result.end.add(delta)

    return result
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

  get isOk () {
    return (this.status === Solver.STATUSES.ok)
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

  get plane2 () {
    let line3 = this.line3
    let c = new THREE.Vector3()

    c.addVectors(line3.start, this.plane.normal)

    let plane = new THREE.Plane()

    plane.setFromCoplanarPoints(line3.start, line3.end, c)

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
    let line = new THREE.Line3(
      this._current.b,
      this._current.c
    )

    return Solver.line(line)
  }

  // Серединный перпендикуляр line1
  get line3 () {
    return Solver.lineMiddlePerpendicular(this.line1, this.plane.normal)
  }

  // Серединный перпендикул line2
  get line4 () {
    return Solver.lineMiddlePerpendicular(this.line2, this.plane.normal)
  }

  get center () {
    return this.plane2.intersectLine(this.line4)
  }

  get radius () {
    return this.center.distanceTo(this._current.a)
  }

  nice (name) {
    let self = this
    let {a, b, c, center, radius} = this._current

    let attributes = {
      line1: function () {
        return new THREE.Line3(a, b)
      },

      line2: function () {
        return new THREE.Line3(b, c)
      },

      line3: function () {
        let line = new THREE.Line3(
          center,
          self.line1.getCenter()
        )

        let r = line.delta().normalize().multiplyScalar(radius)

        line.end.addVectors(center, r)

        return line
      },

      line4: function () {
        let line = new THREE.Line3(
          center,
          self.line2.getCenter()
        )

        let r = line.delta().normalize().multiplyScalar(radius)

        line.end.addVectors(center, r)

        return line
      }
    }

    return Solver.niceLine(attributes[name]())
  }

  clear () {
    this._status = Solver.STATUSES.none
  }

  run (a, b, c) {
    this._current = {a, b, c}

    // Проверка точек на то, можно и из них попытаться слепить окружность
    if (!Solver.testPoints(a, b, c)) {
      this._status = Solver.STATUSES.collinear
      return false
    }

    let center = this.center

    if (center === undefined) {
      this._status = Solver.STATUSES.noCenter
      return false
    }

    if (Math.abs(center.distanceToSquared(a) - center.distanceToSquared(b)) > Solver.EPSILON ||
      Math.abs(center.distanceToSquared(a) - center.distanceToSquared(c)) > Solver.EPSILON ||
      Math.abs(center.distanceToSquared(b) - center.distanceToSquared(c)) > Solver.EPSILON
    ) {
      this._status = Solver.STATUSES.badCenter
      return false
    }

    this._status = Solver.STATUSES.ok
    this._current.center = center
    this._current.radius = this.radius

    return true
  }
}

module.exports = Solver
