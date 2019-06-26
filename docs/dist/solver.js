"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* global THREE */

/* global options */
var Solver =
/*#__PURE__*/
function () {
  function Solver() {
    _classCallCheck(this, Solver);

    this._status = null;
    this._current = {};
    this.clear();
  }

  _createClass(Solver, [{
    key: "nice",
    value: function nice(name) {
      var self = this;
      var _this$_current = this._current,
          a = _this$_current.a,
          b = _this$_current.b,
          c = _this$_current.c,
          center = _this$_current.center,
          radius = _this$_current.radius;
      var attributes = {
        line1: function line1() {
          return new THREE.Line3(a, b);
        },
        line2: function line2() {
          return new THREE.Line3(b, c);
        },
        line3: function line3() {
          var line = new THREE.Line3(center, self.line1.getCenter());
          var r = line.delta().normalize().multiplyScalar(radius);
          line.end.addVectors(center, r);
          return line;
        },
        line4: function line4() {
          var line = new THREE.Line3(center, self.line2.getCenter());
          var r = line.delta().normalize().multiplyScalar(radius);
          line.end.addVectors(center, r);
          return line;
        }
      };
      return Solver.niceLine(attributes[name]());
    }
  }, {
    key: "clear",
    value: function clear() {
      this._status = Solver.STATUSES.none;
    }
  }, {
    key: "run",
    value: function run(a, b, c) {
      this._current = {
        a: a,
        b: b,
        c: c // Проверка точек на то, можно и из них попытаться слепить окружность

      };

      if (!Solver.testPoints(a, b, c)) {
        this._status = Solver.STATUSES.collinear;
        return false;
      }

      var center = this.center;

      if (center === undefined) {
        this._status = Solver.STATUSES.noCenter;
        return false;
      }

      if (Math.abs(center.distanceToSquared(a) - center.distanceToSquared(b)) > Solver.EPSILON || Math.abs(center.distanceToSquared(a) - center.distanceToSquared(c)) > Solver.EPSILON || Math.abs(center.distanceToSquared(b) - center.distanceToSquared(c)) > Solver.EPSILON) {
        this._status = Solver.STATUSES.badCenter;
        return false;
      }

      this._status = Solver.STATUSES.ok;
      this._current.center = center;
      this._current.radius = this.radius;
      return true;
    }
  }, {
    key: "status",
    get: function get() {
      return this._status;
    }
  }, {
    key: "isOk",
    get: function get() {
      return this.status === Solver.STATUSES.ok;
    }
  }, {
    key: "plane",
    get: function get() {
      var plane = new THREE.Plane();
      plane.setFromCoplanarPoints(this._current.a, this._current.b, this._current.c);
      return plane;
    }
  }, {
    key: "plane2",
    get: function get() {
      var line3 = this.line3;
      var c = new THREE.Vector3();
      c.addVectors(line3.start, this.plane.normal);
      var plane = new THREE.Plane();
      plane.setFromCoplanarPoints(line3.start, line3.end, c);
      return plane;
    }
  }, {
    key: "line1",
    get: function get() {
      var line = new THREE.Line3(this._current.a, this._current.b);
      return Solver.line(line);
    }
  }, {
    key: "line2",
    get: function get() {
      var line = new THREE.Line3(this._current.b, this._current.c);
      return Solver.line(line);
    } // Серединный перпендикуляр line1

  }, {
    key: "line3",
    get: function get() {
      return Solver.lineMiddlePerpendicular(this.line1, this.plane.normal);
    } // Серединный перпендикул line2

  }, {
    key: "line4",
    get: function get() {
      return Solver.lineMiddlePerpendicular(this.line2, this.plane.normal);
    }
  }, {
    key: "center",
    get: function get() {
      return this.plane2.intersectLine(this.line4);
    }
  }, {
    key: "radius",
    get: function get() {
      return this.center.distanceTo(this._current.a);
    }
  }], [{
    key: "testPoints",
    value: function testPoints(a, b, c) {
      var v1 = new THREE.Vector3();
      var v2 = new THREE.Vector3();
      var v = v1.subVectors(c, b).cross(v2.subVectors(a, b));
      return v.lengthSq() > Solver.EPSILON;
    }
  }, {
    key: "line",
    value: function line(l) {
      return Solver.lineEnlarge(l, options.plotSize);
    }
  }, {
    key: "niceLine",
    value: function niceLine(l) {
      return Solver.lineEnlarge(l, options.linesEnlargeLength);
    }
  }, {
    key: "lineEnlarge",
    value: function lineEnlarge(line, length) {
      var delta = line.delta().normalize().multiplyScalar(length);
      var result = new THREE.Line3();
      result.copy(line);
      result.start.sub(delta);
      result.end.add(delta);
      return result;
    }
  }, {
    key: "lineMiddlePerpendicular",
    value: function lineMiddlePerpendicular(line, normal) {
      var center = line.getCenter();
      var delta = line.delta().cross(normal);
      var result = new THREE.Line3();
      result.start.subVectors(center, delta);
      result.end.addVectors(center, delta);
      return result;
    }
  }, {
    key: "EPSILON",
    get: function get() {
      return 1e-5;
    }
  }, {
    key: "STATUSES",
    get: function get() {
      return {
        none: 'Задача ещё не решалась',
        collinear: 'Точки расположены на одной прямой',
        ok: 'Окружность построена',
        noCenter: 'Не удалось найти центр окружности',
        badCenter: 'Расстояния от центра окружности до точек на ней не совпадают'
      };
    }
  }]);

  return Solver;
}(); // module.exports = Solver
