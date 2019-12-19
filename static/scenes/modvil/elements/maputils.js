
export function elementMapsOverlay(layer = 'floatPane') {
  return new class extends google.maps.OverlayView {
    constructor() {
      super();
      this._position = null;
      this._container = document.createElement('div');
      this._container.style.willChange = 'transform';

      this._container.addEventListener('click', (ev) => ev.stopPropagation());
    }

    onAdd() {
      const n = this.getPanes()[layer];
      n.append(this._container);
    }

    onRemove() {
      const n = this.getPanes()[layer];
      n.removeChild(this._container);  // noop if not here
    }

    set position(latLng) {
      this._position = latLng;
    }

    get position() {
      return this._position;
    }

    get container() {
      return this._container;
    }

    draw() {
      const projection = this.getProjection();
      if (!projection || !this._position) {
        this._container.hidden = true;
        return;
      }

      this._container.hidden = false;

      const pos = projection.fromLatLngToDivPixel(this._position);
      this._container.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
  };
}
