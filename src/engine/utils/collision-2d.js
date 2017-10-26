const { Vector2 } = self.THREE;

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
    if ((a.position.x + a.width) < b.position.x ||
        (b.position.x + b.width) < a.position.x ||
        (a.position.y + a.height) < b.position.y ||
        (b.position.y + b.height) < a.position.y) {
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

    const halfWidth = rectangle.width / 2;

    if (circleDistance.x > (halfWidth + circle.radius)) {
      return false;
    }

    const halfHeight = rectangle.height / 2;

    if (circleDistance.y > (halfHeight + cricle.radius)) {
      return false;
    }

    if (circleDistance.x <= halfWidth || circleDistance.y <= halfHeight) {
      return true;
    }

    const cornerDistanceSquared =
        Math.pow(circleDistance.x - halfWidth, 2) +
        Math.pow(circleDistance.y - halfHeight, 2);

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
    const halfWidth = rectangle.width / 2;
    const halfHeight = rectangle.height / 2;

    if (point.x < (rectangle.position.x - halfWidth) ||
        point.x > (rectangle.position.x + halfHeight) ||
        point.y < (rectangle.position.y - halfHeight) ||
        point.y > (rectangle.position.y + halfHeight)) {
      return false;
    }

    return true;
  };
})();


export class AbstractShape {
  intersects(other) {
    console.warn('Intersection attempted between two unsupported types:',
        this, other);
    return false;
  }
};


export class Point extends AbstractShape {
  constructor(position) {
    super();
    this.position = position;
  }

  intersects(other) {
    if (other instanceof Circle) {
      return pointIntersectsCircle(this, other);
    } else if (other instanceof Rectangle) {
      return pointIntersectsRectangle(this, other);
    }

    return super.intersects(other);
  }
};


export class Line extends AbstractShape {
  constructor(a, b) {
    super();
    this.a = a;
    this.b = b;
  }

  intersects(other) {
    if (other instanceof Line) {
      return lineIntersectsLine(this, other);
    }

    return super.intersects(other);
  }
};


const $radius = Symbol('radius');

export class Circle {
  set radius(value) {
    this[$radius] = value;
    this.radiusSquared = value * value;
  }

  get radius() {
    return this[$radius];
  }

  constructor(radius = 0, position = new Vector2()) {
    super();
    this.radius = radius;
    this.position = position;
  }

  intersects(other) {
    if (other instanceof Circle) {
      return circleIntersectsCircle(this, other);
    } else if (other instanceof Rectangle) {
      return circleIntersectsRectangle(this, other);
    }

    return super.intersects(other);
  }
};


export class Rectangle {
  constructor(width = 0, height = 0, position = new Vector2()) {
    super();
    this.width = width;
    this.height = height;
    this.position = position;
  }

  intersects(other) {
    if (other instanceof Rectangle) {
      return rectangleIntersectsRectangle(this, other);
    } else if (other instanceof Circle) {
      return circleIntersectsRectangle(other, this);
    }

    return super.intersects(other);
  }
};


