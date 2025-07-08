import { e as createLogger } from "./analytics-CbggJMJ_.js";
const _PackageContextResolver = class _PackageContextResolver {
  /**
   * Find package ID from parent DOM context
   * Searches up the DOM tree for package ID attributes
   */
  static findPackageId(element) {
    let current = element.parentElement;
    while (current) {
      for (const attr of this.PACKAGE_ID_ATTRS) {
        const value = current.getAttribute(attr);
        if (value) {
          const id = parseInt(value, 10);
          if (!isNaN(id)) {
            this.logger.debug(`Found context package ID: ${id} from element:`, current);
            return id;
          }
        }
      }
      current = current.parentElement;
    }
    this.logger.debug("No context package ID found in parent elements");
    return void 0;
  }
  /**
   * Get package ID from element or its context
   * First checks element itself, then searches parents
   */
  static getPackageId(element) {
    for (const attr of this.PACKAGE_ID_ATTRS) {
      const value = element.getAttribute(attr);
      if (value) {
        const id = parseInt(value, 10);
        if (!isNaN(id)) {
          this.logger.debug(`Found direct package ID: ${id} from element:`, element);
          return id;
        }
      }
    }
    return this.findPackageId(element);
  }
};
_PackageContextResolver.logger = createLogger("PackageContextResolver");
_PackageContextResolver.PACKAGE_ID_ATTRS = [
  "data-next-package-id",
  "data-next-package",
  "data-package-id"
];
let PackageContextResolver = _PackageContextResolver;
export {
  PackageContextResolver as P
};
