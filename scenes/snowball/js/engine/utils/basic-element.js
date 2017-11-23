const {
  ShadyCSS
} = self;

const preparedTemplates = new WeakSet();

export class BasicElement extends HTMLElement {
  static get is() { return null; }

  static get template() {
    return null;
  }

  static prepareTemplate() {
    if (preparedTemplates.has(this)) {
      return;
    }

    const { template, is } = this;

    if (ShadyCSS != null && is != null && template != null) {
      ShadyCSS.prepareTemplate(template, is);
    }

    preparedTemplates.add(this);
  }

  stampTemplate() {
    this.attachShadow({ mode: 'open' });
    this.constructor.prepareTemplate();

    const template = this.constructor.template;

    if (template != null) {
      this.shadowRoot.appendChild(
          document.importNode(template.content, true));
    }
  }
};
