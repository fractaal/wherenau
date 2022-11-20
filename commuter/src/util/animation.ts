import { Marker } from 'maplibre-gl';
import Position from 'src/models/Position';

export const animateMarker = (
  marker: Marker,
  to: Position,
  duration = 1000
) => {
  const { lng: startLng, lat: startLat } = marker.getLngLat();
  const start = performance.now();

  const animate = (timestamp: number) => {
    // Animate over time with duration in ms
    const progress = Math.min((timestamp - start) / duration, 1);

    const newLng = startLng + (to.lng - startLng) * progress;
    const newLat = startLat + (to.lat - startLat) * progress;

    // console.log(newLng, newLat);

    // Update marker position
    marker.setLngLat({
      lng: newLng,
      lat: newLat,
    });

    // Repeat until done
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};
