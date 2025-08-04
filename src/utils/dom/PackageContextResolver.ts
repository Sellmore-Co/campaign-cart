import { Logger, createLogger } from '@/utils/logger';

export class PackageContextResolver {
  private static logger: Logger = createLogger('PackageContextResolver');
  
  private static readonly PACKAGE_ID_ATTRS = [
    'data-next-package-id',
    'data-next-package',
    'data-package-id'
  ];
  
  /**
   * Find package ID from parent DOM context
   * Searches up the DOM tree for package ID attributes
   */
  static findPackageId(element: HTMLElement): number | undefined {
    let current: HTMLElement | null = element.parentElement;
    
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
    
    this.logger.debug('No context package ID found in parent elements');
    return undefined;
  }
  
  /**
   * Get package ID from element or its context
   * First checks element itself, then searches parents
   */
  static getPackageId(element: HTMLElement): number | undefined {
    // Check element itself first
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
    
    // Then check parent context
    return this.findPackageId(element);
  }
}