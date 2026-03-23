import {
  isServer
} from "./chunk-Q3L7YFTT.js";

// node_modules/@material/web/labs/behaviors/element-internals.js
var internals = /* @__PURE__ */ Symbol("internals");
var privateInternals = /* @__PURE__ */ Symbol("privateInternals");
function mixinElementInternals(base) {
  class WithElementInternalsElement extends base {
    get [internals]() {
      if (!this[privateInternals]) {
        this[privateInternals] = this.attachInternals();
      }
      return this[privateInternals];
    }
  }
  return WithElementInternalsElement;
}

// node_modules/@material/web/internal/controller/form-submitter.js
function setupFormSubmitter(ctor) {
  if (isServer) {
    return;
  }
  ctor.addInitializer((instance) => {
    const submitter = instance;
    submitter.addEventListener("click", async (event) => {
      const { type, [internals]: elementInternals } = submitter;
      const { form } = elementInternals;
      if (!form || type === "button") {
        return;
      }
      await new Promise((resolve) => {
        setTimeout(resolve);
      });
      if (event.defaultPrevented) {
        return;
      }
      if (type === "reset") {
        form.reset();
        return;
      }
      form.addEventListener("submit", (submitEvent) => {
        Object.defineProperty(submitEvent, "submitter", {
          configurable: true,
          enumerable: true,
          get: () => submitter
        });
      }, { capture: true, once: true });
      elementInternals.setFormValue(submitter.value);
      form.requestSubmit();
    });
  });
}

export {
  internals,
  mixinElementInternals,
  setupFormSubmitter
};
//# sourceMappingURL=chunk-NF6OEKEX.js.map
