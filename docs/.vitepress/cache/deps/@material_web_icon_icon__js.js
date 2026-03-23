import {
  LitElement,
  __decorate,
  css,
  customElement,
  html
} from "./chunk-Q3L7YFTT.js";

// node_modules/@material/web/icon/internal/icon.js
var Icon = class extends LitElement {
  render() {
    return html`<slot></slot>`;
  }
  connectedCallback() {
    super.connectedCallback();
    const ariaHidden = this.getAttribute("aria-hidden");
    if (ariaHidden === "false") {
      this.removeAttribute("aria-hidden");
      return;
    }
    this.setAttribute("aria-hidden", "true");
  }
};

// node_modules/@material/web/icon/internal/icon-styles.js
var styles = css`:host{font-size:var(--md-icon-size, 24px);width:var(--md-icon-size, 24px);height:var(--md-icon-size, 24px);color:inherit;font-variation-settings:inherit;font-weight:400;font-family:var(--md-icon-font, Material Symbols Outlined);display:inline-flex;font-style:normal;place-items:center;place-content:center;line-height:1;overflow:hidden;letter-spacing:normal;text-transform:none;user-select:none;white-space:nowrap;word-wrap:normal;flex-shrink:0;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale}::slotted(svg){fill:currentColor}::slotted(*){height:100%;width:100%}
`;

// node_modules/@material/web/icon/icon.js
var MdIcon = class MdIcon2 extends Icon {
};
MdIcon.styles = [styles];
MdIcon = __decorate([
  customElement("md-icon")
], MdIcon);
export {
  MdIcon
};
//# sourceMappingURL=@material_web_icon_icon__js.js.map
