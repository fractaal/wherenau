export default function createMarkerElement() {
  const marker = document.createElement('div');

  marker.style.width = '24px';
  marker.style.height = '24px';

  marker.style.backgroundColor = 'white';

  // Soft box shadow
  marker.style.boxShadow = '0 0 5px 0px rgba(0,0,0,0.4)';

  const innerElement = document.createElement('div');
  marker.appendChild(innerElement);

  innerElement.style.width = '18px';
  innerElement.style.height = '18px';
  innerElement.style.borderRadius = '100%';

  innerElement.style.backgroundColor = 'red';

  marker.style.borderRadius = '100%';

  // Center inner element in marker
  innerElement.style.position = 'absolute';
  innerElement.style.top = '50%';
  innerElement.style.left = '50%';
  innerElement.style.transform = 'translate(-50%, -50%)';

  function changeColor(color: string) {
    innerElement.style.backgroundColor = color;
  }

  return {
    marker,
    changeColor,
  };
}
