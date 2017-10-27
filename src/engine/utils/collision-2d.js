import { Allocatable } from './allocatable.js';

const { Vector2 } = self.THREE;


export class AbstractShape {
  get type() {
    return 'abstract';
  }

  contains(other) {
    const tests = containmentTests[this.type];
    const test = tests && tests[other.type];

    if (test != null) {
      return test(this, other);
    }

    console.warn('Containment test attempted between two unsupported types:',
        this, other);
    return false;

  }

  intersects(other) {
    const tests = intersectionTests[this.type];
    const test = tests && tests[other.type];

    if (test != null) {
      return test(this, other);
    }

    console.warn('Intersection test attempted between two unsupported types:',
        this, other);
    return false;
  }
};


export class Point extends Allocatable(AbstractShape) {
  get type() {
    return 'point';
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get width() {
    return 1;
  }

  get height() {
    return 1;
  }

  setup(position) {
    this.position = position;
  }

  teardown() {
    this.position = null;
  }
};


export class Line extends Allocatable(AbstractShape) {
  get type() {
    return 'line';
  }

  get x() {
    return this.midpoint.x;
  }

  get y() {
    return this.midpoint.y;
  }

  get width() {
    return Math.abs(this.a.x - this.b.x);
  }

  get height() {
    return Math.abs(this.a.y - this.b.y);
  }

  constructor() {
    super();
    this.midpoint = new Vector2();
  }

  setup(a, b) {
    this.a = a;
    this.b = b;
    this.midpoint.set((this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2);
  }

  teardown() {
    this.a = null;
    this.b = null;
  }
};


export class Circle extends Allocatable(AbstractShape) {
  get type() {
    return 'circle';
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.width;
  }

  setup(radius, position) {
    this.radius = radius;
    this.position = position;
    this.radiusSquared = radius * radius;
  }

  teardown() {
    this.radius = 0;
    this.position = null;
    this.radiusSquared = 0;
  }
};


export class Rectangle extends Allocatable(AbstractShape) {
  get type() {
    return 'rectangle';
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  constructor() {
    super();

    this.tl = new Vector2();
    this.tr = new Vector2();
    this.bl = new Vector2();
    this.br = new Vector2();

    this.vertices = [this.tl, this.tr, this.br, this.bl];
  }

  setup(width, height, position) {
    this.width = width;
    this.height = height;
    this.position = position;

    this.halfWidth = width / 2;
    this.halfHeight = height / 2;

    this.tl.set(this.position.x - this.halfWidth,
        this.position.y - this.halfHeight);
    this.br.set(this.position.x + this.halfWidth,
        this.position.y + this.halfHeight);

    this.tr.set(this.br.x, this.tl.y);
    this.bl.set(this.tl.x, this.br.y);
  }

  teardown() {
    this.width = 0;
    this.height = 0;
    this.position = null;

    this.halfWidth = 0;
    this.halfHeight = 0;

    this.tl.set(0, 0);
    this.br.set(0, 0);
    this.tr.set(0, 0);
    this.bl.set(0, 0);
  }
};


// @see https://www.gamedev.net/articles/programming/math-and-physics/diy-2d-vector-physics-r4106/
export const lineIntersectsLine = (() => {
  const u0 = new Vector2();
  const u1 = new Vector2();
  const v0 = new Vector2();
  const v1 = new Vector2();

  return (a, b) => {
    v0.subVectors(a.b, a.a);
    v1.subVectors(a.a, b.a);
    u0.subVectors(b.b, b.a);
    u1.subVectors(a.b, b.b);

    const d = u0[0] * v0[1] - u0[1] * v0[0];
    const r = (v1.y * v0.x - v1.x * v0.y) / d;
    const s = (v1.y * u0.x - v1.x * u0.y) / d;

    return 0 <= r && r <= 1 && 0 <= s && s <= 1;
  };
})();

export const circleIntersectsCircle = (() => {
  const delta = new Vector2();

  return (a, b) => {
    const proximity = delta.subVectors(a.position, b.position).length();
    const tangentDistance = a.radius + b.radius;

    return proximity < tangentDistance;
  };
})();

export const rectangleIntersectsRectangle = (() => {
  return (a, b) => {
    if ((a.x + a.width) < b.x ||
        (b.x + b.width) < a.x ||
        (a.y + a.height) < b.y ||
        (b.y + b.height) < a.y) {
      return false
    }

    return true;
  };
})();

// @see https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection#402010
export const circleIntersectsRectangle = (() => {
  const circleDistance = new Vector2();

  return (circle, rectangle) => {
    circleDistance.subVectors(circle.position, rectangle.position);
    circleDistance.x = Math.abs(circleDistance.x);
    circleDistance.y = Math.abs(circleDistance.y);

    if (circleDistance.x > (rectangle.halfWidth + circle.radius)) {
      return false;
    }

    if (circleDistance.y > (rectangle.halfHeight + cricle.radius)) {
      return false;
    }

    if (circleDistance.x <= rectangle.halfWidth ||
        circleDistance.y <= rectangle.halfHeight) {
      return true;
    }

    const cornerDistanceSquared =
        Math.pow(circleDistance.x - rectangle.halfWidth, 2) +
        Math.pow(circleDistance.y - rectangle.halfHeight, 2);

    return cornerDistanceSquared <= circle.radiusSquared;
  };
})();

export const pointIntersectsCircle = (() => {
  const delta = new Vector2();

  return (point, circle) => {
    const distance = delta.subVectors(point.position, circle.position).length();
    return distance <= circle.radius;
  };
})();

export const pointIntersectsRectangle = (() => {
  return (point, rectangle) => {
    if (point.x < (rectangle.x - rectangle.halfWidth) ||
        point.x > (rectangle.x + rectangle.halfHeight) ||
        point.y < (rectangle.y - rectangle.halfHeight) ||
        point.y > (rectangle.y + rectangle.halfHeight)) {
      return false;
    }

    return true;
  };
})();

// @see https://www.gamedev.net/articles/programming/math-and-physics/diy-2d-vector-physics-r4106/
export const lineIntersectsRectangle = (() => {
  const intermediateLine = new Line();

  return (line, rectangle) => {
    let intersects = false;

    for (let i = 0, v0 = rectangle.bl; i < rectangle.vertices.length; ++i) {
      let v1 = rectangle.vertices[i];

      intermediateLine.setup(v0, v1);

      if (lineIntersectsLine(line, intermediateLine)) {
        intersects = true;
        break;
      }

      v0 = v1;
    }

    intermediateLine.teardown();
    return false;
  };
})();


export const intersectionTests = {
  point: {
    point: (point, other) => point.x === other.x && point.y === other.y,
    rectangle: (point, rectangle) =>
        pointIntersectsRectangle(point, rectangle),
    circle: (point, circle) => pointIntersectsCircle(point, circle)
  },
  line: {
    rectangle: (line, rectangle) => lineIntersectsRectangle(line, rectangle),
    line: (line, other) => lineIntersectsLine(line, other)
  },
  circle: {
    circle: (circle, other) => circleIntersectsCircle(circle, other),
    rectangle: (circle, rectangle) =>
        circleIntersectsRectangle(circle, rectangle),
    point: (circle, point) => pointIntersectsCircle(point, circle)
  },
  rectangle: {
    point: (rectangle, point) => pointIntersectsRectangle(point, rectangle),
    line: (rectangle, line) => lineIntersectsRectangle(line, rectangle),
    circle: (rectangle, circle) => circleIntersectsRectangle(circle, rectangle),
    rectangle: (rectangle, other) =>
        rectangleIntersectsRectangle(rectangle, other)
  }
};


export const rectangleContainsPoint = (rectangle, point) => {
  if (point.x < rectangle.tl.x || point.x > rectangle.br.x ||
      point.y > rectangle.bl.y || point.y < rectangle.tr.y) {
    return false;
  }

  return true;
};

export const rectangleContainsRectangle = (rectangle, other) => {
  if (!rectangleContainsPoint(rectangle, other.tl) ||
      !rectangleContainsPoint(rectangle, other.br)) {
    return false;
  }

  return true;
};

export const containmentTests = {
  rectangle: {
    point: rectangleContainsPoint,
    rectangle: rectangleContainsRectangle
  },

  point: {
    rectangle: (point, rectangle) => rectangleContainsPoint(rectangle, point)
  }
};
