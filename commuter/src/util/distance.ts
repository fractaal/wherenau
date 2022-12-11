import Position from 'src/models/Position';

// Accept two coordinates and return the distance between them in meters
export function distanceBetweenCoordinates(
  pos1: Position,
  pos2: Position
): number {
  const R = 6371e3; // metres
  const φ1 = (pos1.lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (pos2.lat * Math.PI) / 180;
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}
