
export class SantaChoiceElement extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement('template');
    template.innerHTML = `
<style>${_style`santa-choice`}</style>
<div class="wrap">
  <button class="left"></button>
  <div class="scroller">
    <slot></slot>
  </div>
  <button class="right"></button>
</div>
`;
    if (self.ShadyCSS) {
      self.ShadyCSS.prepareTemplate(template, is);
    }

    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(document.importNode(template.content, true));
    this._wrapEl = this.shadowRoot.querySelector('.wrap');
    this._scrollerEl = this._wrapEl.querySelector('.scroller');

    this._scrollerEl.addEventListener('wheel', (ev) => {
      this._scrollerEl.scrollLeft += ev.deltaY;
    }, {passive: true});

    let rAF;
    this._requestCheck = () => {
      if (!rAF) {
        rAF = self.requestAnimationFrame(() => {
          rAF = 0;
          this._check();
        });
      }
    };
    this._scrollerEl.addEventListener('scroll', this._requestCheck, {passive: true});
    const mo = new MutationObserver(this._requestCheck);
    mo.observe(this, {childList: true, subtree: true});

    let prev = 0;
    let active = null;

    const update = (now) => {
      if (active === null) {
        return;
      }
      window.requestAnimationFrame(update);
      const delta = prev - now;
      prev = now;

      if (active) {
        this._scrollerEl.scrollLeft -= delta/2;
      } else {
        this._scrollerEl.scrollLeft += delta/2;
      }
    };

    const setup = (ev) => {
      cancel();
      if (ev.target.classList.contains('left')) {
        active = false;
      } else if (ev.target.classList.contains('right')) {
        active = true;
      } else {
        return;
      }
      ev.preventDefault();

      prev = performance.now();
      window.requestAnimationFrame(update);
    };

    this._wrapEl.addEventListener('touchstart', setup);
    this._wrapEl.addEventListener('mousedown', setup);

    const cancel = () => {
      active = null;
    };

    ['mouseup', 'mouseout', 'touchend', 'touchcancel'].forEach((eventName) => {
      this._wrapEl.addEventListener(eventName, cancel);
    });
  }

  connectedCallback() {
    window.addEventListener('resize', this._requestCheck);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._requestCheck);
  }

  _check() {
    const el = this._scrollerEl;
    const cl = this._wrapEl.classList;

    if (el.scrollWidth <= this._wrapEl.offsetWidth + 42) {
      cl.remove('left', 'right');
    } else {
      cl.toggle('left', Boolean(el.scrollLeft));
      cl.toggle('right', Boolean(el.scrollLeft < el.scrollWidth - this._wrapEl.offsetWidth));
    }
  }
}


customElements.define('santa-choice', SantaChoiceElement);
