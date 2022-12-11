declare namespace maplibregl {
  interface Marker {
    __marker: {
      marker: HTMLElement;
      changeColor: (color: string) => void;
    };
  }
}
