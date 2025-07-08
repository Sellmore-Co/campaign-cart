class TemplateRenderer {
  /**
   * Renders a template string by replacing {placeholder} patterns with actual values
   * @param template - Template string with {key.subkey} placeholders
   * @param options - Data, formatters, and default values
   * @returns Rendered HTML string
   */
  static render(template, options) {
    const { data, formatters = {}, defaultValues = {} } = options;
    return template.replace(/\{([^}]+)\}/g, (_, placeholder) => {
      try {
        const value = this.getValue(data, placeholder);
        const formattedValue = this.formatValue(value, placeholder, formatters);
        if (formattedValue === "" || formattedValue === null || formattedValue === void 0) {
          return defaultValues[placeholder] || "";
        }
        return String(formattedValue);
      } catch (error) {
        console.warn(`Template rendering error for placeholder ${placeholder}:`, error);
        return defaultValues[placeholder] || "";
      }
    });
  }
  /**
   * Extracts nested property value from data object
   * Handles paths like "item.price", "item.price.raw", "item.showUpsell"
   */
  static getValue(data, path) {
    const keys = path.split(".");
    let current = data;
    for (const key of keys) {
      if (current === null || current === void 0) {
        return void 0;
      }
      current = current[key];
    }
    return current;
  }
  /**
   * Applies formatting based on placeholder path and available formatters
   */
  static formatValue(value, placeholder, formatters) {
    if (placeholder.endsWith(".raw")) {
      return value;
    }
    const currencyFields = [
      "price",
      "total",
      "savings",
      "amount",
      "cost",
      "fee",
      "charge",
      "compare",
      "retail",
      "recurring",
      "subtotal",
      "tax",
      "shipping",
      "discount",
      "credit",
      "balance",
      "payment",
      "refund"
    ];
    const shouldFormatAsCurrency = currencyFields.some(
      (field) => placeholder.toLowerCase().includes(field.toLowerCase())
    );
    if (shouldFormatAsCurrency && typeof value === "number") {
      return formatters.currency ? formatters.currency(value) : value;
    }
    if (shouldFormatAsCurrency && typeof value === "string" && !isNaN(parseFloat(value))) {
      return formatters.currency ? formatters.currency(parseFloat(value)) : value;
    }
    if (placeholder.includes("date") || placeholder.includes("created_at")) {
      return formatters.date ? formatters.date(value) : value;
    }
    if (typeof value === "string" && (placeholder.includes("name") || placeholder.includes("title") || placeholder.includes("description"))) {
      return formatters.escapeHtml ? formatters.escapeHtml(value) : value;
    }
    return value;
  }
  /**
   * Validates template for common issues
   * Returns list of potential problems
   */
  static validateTemplate(template, availablePlaceholders) {
    const issues = [];
    const usedPlaceholders = this.extractPlaceholders(template);
    for (const placeholder of usedPlaceholders) {
      const basePlaceholder = placeholder.replace(".raw", "");
      if (!availablePlaceholders.some((p) => p.startsWith(basePlaceholder))) {
        issues.push(`Unknown placeholder: {${placeholder}}`);
      }
    }
    const unclosed = template.match(/\{[^}]*$/g);
    if (unclosed) {
      issues.push(`Unclosed placeholders found: ${unclosed.join(", ")}`);
    }
    return issues;
  }
  /**
   * Extracts all placeholders from template
   */
  static extractPlaceholders(template) {
    const matches = template.match(/\{([^}]+)\}/g) || [];
    return matches.map((match) => match.slice(1, -1));
  }
  /**
   * Creates default formatters that both cart and order enhancers can use
   */
  static createDefaultFormatters() {
    return {
      currency: (amount) => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount),
      date: (dateValue) => {
        if (!dateValue) return "";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return String(dateValue);
          return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(date);
        } catch {
          return String(dateValue);
        }
      },
      escapeHtml: (text) => {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      }
    };
  }
}
export {
  TemplateRenderer as T
};
