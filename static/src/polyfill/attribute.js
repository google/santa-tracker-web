
if (!Element.prototype.toggleAttribute) {
  Element.prototype.toggleAttribute = function(name, force) {
    force = Boolean(force);

    if (this.hasAttribute(name)) {
      if (force) {
        return true;
      }
      this.removeAttribute(name);
      return false;
    }
    if (force === false) {
      return false;
    }
    this.setAttribute(name, '');
    return true;
  };
}
