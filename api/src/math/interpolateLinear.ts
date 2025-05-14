export function interpolateLinear(
  startPoint: number,
  endPoint: number,
  startValue: number,
  endValue: number,
  t: number,
): number {
  if (startPoint === endPoint) {
    throw new Error('Start and end points must be different to interpolate.');
  }

  const ratio = (t - startPoint) / (endPoint - startPoint);
  return startValue + (endValue - startValue) * ratio;
}
