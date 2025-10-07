// Event schema types and definitions for analytics v2

export interface ProductSchema {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

export interface ImpressionSchema {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  currency?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

export interface UserPropertiesSchema {
  visitor_type?: string;
  customer_id?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_address_city?: string;
  customer_address_province?: string;
  customer_address_province_code?: string;
  customer_address_country?: string;
  customer_address_country_code?: string;
  customer_address_zip?: string;
  customer_order_count?: number;
  customer_total_spent?: number;
  customer_tags?: string;
  [key: string]: any;
}

export interface BaseEventSchema {
  event: string;
  event_id?: string;
  timestamp?: number;
  user_properties?: UserPropertiesSchema;
  ecommerce?: {
    currency?: string;
    value?: number;
    coupon?: string;
    items?: ProductSchema[];
    impressions?: ImpressionSchema[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  properties?: Record<string, FieldDefinition>;
  items?: FieldDefinition;
  enum?: any[];
}

export interface EventSchema {
  name: string;
  fields: Record<string, FieldDefinition>;
}

// Common field definitions
const userPropertiesFields: Record<string, FieldDefinition> = {
  visitor_type: { type: 'string' },
  customer_id: { type: 'string' },
  customer_email: { type: 'string' },
  customer_phone: { type: 'string' },
  customer_first_name: { type: 'string' },
  customer_last_name: { type: 'string' },
  customer_address_city: { type: 'string' },
  customer_address_province: { type: 'string' },
  customer_address_province_code: { type: 'string' },
  customer_address_country: { type: 'string' },
  customer_address_country_code: { type: 'string' },
  customer_address_zip: { type: 'string' },
  customer_order_count: { type: 'number' },
  customer_total_spent: { type: 'number' },
  customer_tags: { type: 'string' }
};

const productFields: Record<string, FieldDefinition> = {
  item_id: { type: 'string', required: true },
  item_name: { type: 'string', required: true },
  affiliation: { type: 'string' },
  coupon: { type: 'string' },
  currency: { type: 'string' },
  discount: { type: 'number' },
  index: { type: 'number' },
  item_brand: { type: 'string' },
  item_category: { type: 'string' },
  item_category2: { type: 'string' },
  item_category3: { type: 'string' },
  item_category4: { type: 'string' },
  item_category5: { type: 'string' },
  item_list_id: { type: 'string' },
  item_list_name: { type: 'string' },
  item_variant: { type: 'string' },
  item_image: { type: 'string' },
  location_id: { type: 'string' },
  price: { type: 'number' },
  quantity: { type: 'number' }
};

const ecommerceWithItemsFields: Record<string, FieldDefinition> = {
  currency: { type: 'string' },
  value: { type: 'number' },
  coupon: { type: 'string' },
  items: {
    type: 'array',
    items: {
      type: 'object',
      properties: productFields
    }
  }
};

const ecommerceWithImpressionsFields: Record<string, FieldDefinition> = {
  currency: { type: 'string' },
  value: { type: 'number' },
  impressions: {
    type: 'array',
    items: {
      type: 'object',
      properties: productFields
    }
  }
};

// Event schemas definitions
export const eventSchemas: Record<string, EventSchema> = {
  dl_user_data: {
    name: 'dl_user_data',
    fields: {
      event: { type: 'string', required: true },
      user_properties: {
        type: 'object',
        required: true,
        properties: userPropertiesFields
      },
      ecommerce: {
        type: 'object',
        properties: {
          ...ecommerceWithItemsFields,
          // cart_contents is deprecated but still supported for backward compatibility
          cart_contents: {
            type: 'array',
            items: {
              type: 'object',
              properties: productFields
            }
          }
        }
      }
    }
  },

  dl_sign_up: {
    name: 'dl_sign_up',
    fields: {
      event: { type: 'string', required: true },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      },
      method: { type: 'string' }
    }
  },

  dl_login: {
    name: 'dl_login',
    fields: {
      event: { type: 'string', required: true },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      },
      method: { type: 'string' }
    }
  },

  dl_view_item_list: {
    name: 'dl_view_item_list',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          item_list_id: { type: 'string' },
          item_list_name: { type: 'string' },
          // impressions is deprecated but still supported for backward compatibility
          impressions: {
            type: 'array',
            items: {
              type: 'object',
              properties: productFields
            }
          }
        }
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_view_search_results: {
    name: 'dl_view_search_results',
    fields: {
      event: { type: 'string', required: true },
      search_term: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        properties: {
          ...ecommerceWithItemsFields,
          item_list_name: { type: 'string' },
          // impressions is deprecated but still supported for backward compatibility
          impressions: {
            type: 'array',
            items: {
              type: 'object',
              properties: productFields
            }
          }
        }
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_select_item: {
    name: 'dl_select_item',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          item_list_id: { type: 'string' },
          item_list_name: { type: 'string' }
        }
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_view_item: {
    name: 'dl_view_item',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_add_to_cart: {
    name: 'dl_add_to_cart',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_remove_from_cart: {
    name: 'dl_remove_from_cart',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_view_cart: {
    name: 'dl_view_cart',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: ecommerceWithItemsFields
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_begin_checkout: {
    name: 'dl_begin_checkout',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          checkout_id: { type: 'string' },
          checkout_step: { type: 'number' }
        }
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_add_shipping_info: {
    name: 'dl_add_shipping_info',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          shipping_tier: { type: 'string' }
        }
      },
      shipping_tier: { type: 'string' },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_add_payment_info: {
    name: 'dl_add_payment_info',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          payment_type: { type: 'string' }
        }
      },
      payment_type: { type: 'string' },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_purchase: {
    name: 'dl_purchase',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        required: true,
        properties: {
          ...ecommerceWithItemsFields,
          transaction_id: { type: 'string', required: true },
          affiliation: { type: 'string' },
          tax: { type: 'number' },
          shipping: { type: 'number' },
          discount: { type: 'number' }
        }
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  dl_subscribe: {
    name: 'dl_subscribe',
    fields: {
      event: { type: 'string', required: true },
      ecommerce: {
        type: 'object',
        properties: {
          ...ecommerceWithItemsFields,
          subscription_id: { type: 'string' },
          subscription_status: { type: 'string' }
        }
      },
      user_properties: {
        type: 'object',
        properties: userPropertiesFields
      }
    }
  },

  // Upsell events
  dl_viewed_upsell: {
    name: 'dl_viewed_upsell',
    fields: {
      event: { type: 'string', required: true },
      order_id: { type: 'string', required: true },
      upsell: {
        type: 'object',
        required: true,
        properties: {
          package_id: { type: 'string', required: true },
          package_name: { type: 'string', required: true },
          price: { type: 'number' },
          currency: { type: 'string' }
        }
      }
    }
  },

  dl_accepted_upsell: {
    name: 'dl_accepted_upsell',
    fields: {
      event: { type: 'string', required: true },
      order_id: { type: 'string', required: true },
      upsell: {
        type: 'object',
        required: true,
        properties: {
          package_id: { type: 'string', required: true },
          package_name: { type: 'string' },
          quantity: { type: 'number' },
          value: { type: 'number', required: true },
          currency: { type: 'string' }
        }
      }
    }
  },

  dl_skipped_upsell: {
    name: 'dl_skipped_upsell',
    fields: {
      event: { type: 'string', required: true },
      order_id: { type: 'string', required: true },
      upsell: {
        type: 'object',
        required: true,
        properties: {
          package_id: { type: 'string' },
          package_name: { type: 'string' }
        }
      }
    }
  }
};

// Validation function
export function validateEventSchema(eventData: any, schema: EventSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function validateField(value: any, fieldDef: FieldDefinition, path: string): void {
    // Check if required field is missing
    if (fieldDef.required && (value === undefined || value === null)) {
      errors.push(`Missing required field: ${path}`);
      return;
    }

    // Skip validation if field is optional and not provided
    if (value === undefined || value === null) {
      return;
    }

    // Validate type
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== fieldDef.type) {
      errors.push(`Invalid type for ${path}: expected ${fieldDef.type}, got ${actualType}`);
      return;
    }

    // Validate enum values
    if (fieldDef.enum && !fieldDef.enum.includes(value)) {
      errors.push(`Invalid value for ${path}: must be one of ${fieldDef.enum.join(', ')}`);
    }

    // Validate object properties
    if (fieldDef.type === 'object' && fieldDef.properties) {
      for (const [propName, propDef] of Object.entries(fieldDef.properties)) {
        validateField(value[propName], propDef, `${path}.${propName}`);
      }
    }

    // Validate array items
    if (fieldDef.type === 'array' && fieldDef.items) {
      value.forEach((item: any, index: number) => {
        validateField(item, fieldDef.items!, `${path}[${index}]`);
      });
    }
  }

  // Validate all fields defined in schema
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    validateField(eventData[fieldName], fieldDef, fieldName);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to get schema by event name
export function getEventSchema(eventName: string): EventSchema | undefined {
  return eventSchemas[eventName];
}

