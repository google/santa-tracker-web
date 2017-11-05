export const erode = {
  vertex: `
vec3 erode(vec2 tileState, float time, vec3 position) {
  if (tileState.x == 3.0) {
    float shakeTime = tileState.y;
    float elapsed = (time - shakeTime) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;

    float xOffset = sin((elapsed * 15.0)) *
        cos(elapsed * 25.0) *
        (3.0 + 3.0 * e3 - 5.0 * elapsed);

    float yOffset = max(e3 - 0.25, 0.0) * 15.0;

    if (elapsed <= 1.75) {
      position.x += xOffset;
      position.z -= yOffset;
    }
  }

  return position;
}`,
  fragment: `
float erode(vec2 tileState, float time) {
  float alpha = 1.0;

  if (tileState.x > 2.0) {
    float elapsed = (time - tileState.y) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;
    alpha = min(1.35 - e3, 1.0);
  }

  return alpha;
}`
};

