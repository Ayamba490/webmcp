/**
 * WebMCP Tool JSON Schema Definitions & Strict Validator
 * Validates tool arguments against official JSON Schema Draft-07 specs
 * Provides detailed error messages for invalid types, missing required fields, and out-of-bound values.
 */

export interface SchemaProperty {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  enum?: (string | number)[];
  minimum?: number;
  maximum?: number;
  items?: SchemaProperty | { type: string; properties?: Record<string, SchemaProperty>; required?: string[] };
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

export interface ToolInputSchema {
  type: "object";
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedArgs: Record<string, any>;
}

// Complete JSON Schemas for all 14 WebMCP Tools
export const WEBMCP_TOOL_SCHEMAS: Record<string, ToolInputSchema> = {
  // 1. search_catalog
  search_catalog: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search keyword" },
      category: {
        type: "string",
        enum: ["peripherals", "audio", "wearables", "computing", "studio"],
        description: "Product category filter",
      },
      maxPrice: { type: "number", minimum: 0, description: "Maximum budget in USD" },
      sortBy: {
        type: "string",
        enum: ["price_asc", "price_desc", "rating", "carbon"],
        description: "Sorting rule",
      },
    },
  },

  // 2. inspect_product_details
  inspect_product_details: {
    type: "object",
    properties: {
      productId: { type: "string", description: "Target product identifier (e.g. 'prod-keyboard-01')" },
    },
    required: ["productId"],
  },

  // 3. compare_products
  compare_products: {
    type: "object",
    properties: {
      productIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of 2 to 4 product IDs to compare",
      },
      criteria: {
        type: "array",
        items: { type: "string" },
        description: "Optional list of criteria to evaluate",
      },
    },
    required: ["productIds"],
  },

  // 4. customize_product_spec
  customize_product_spec: {
    type: "object",
    properties: {
      productId: { type: "string", description: "Product identifier to customize" },
      material: {
        type: "string",
        enum: ["Brushed Titanium", "Matte Obsidian", "Aerospace Walnut", "Emerald Frost"],
        description: "Material finish",
      },
      engravingText: { type: "string", description: "Laser engraving text (max 24 chars)" },
      accentGlow: {
        type: "string",
        enum: ["Cyan Neon", "Solar Amber", "Emerald", "Vapor Violet"],
        description: "RGB accent glow color",
      },
      firmwareProfile: { type: "string", description: "Target firmware preset" },
      engravingFont: {
        type: "string",
        enum: ["JetBrains Mono", "Space Grotesk", "Orbitron", "Cinzel"],
        description: "Laser engraving font family",
      },
    },
    required: ["productId"],
  },

  // 5. add_to_cart
  add_to_cart: {
    type: "object",
    properties: {
      productId: { type: "string", description: "Product identifier" },
      quantity: { type: "number", minimum: 1, maximum: 100, description: "Quantity of items (default 1)" },
      customConfig: { type: "object", description: "Custom specifications object" },
    },
    required: ["productId"],
  },

  // 6. stage_procurement_bundle
  stage_procurement_bundle: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "string" },
            quantity: { type: "number", minimum: 1 },
          },
          required: ["productId"],
        },
        description: "List of products and quantities to stage in bundle",
      },
      shippingTier: {
        type: "string",
        enum: ["standard_eco", "priority_orbital", "same_day_courier"],
        description: "Logistics priority level",
      },
    },
    required: ["items"],
  },

  // 7. negotiate_price_discount
  negotiate_price_discount: {
    type: "object",
    properties: {
      requestedDiscountPct: {
        type: "number",
        minimum: 1,
        maximum: 100,
        description: "Requested discount percentage (1-100%)",
      },
      reasoning: { type: "string", description: "Business justification for discount" },
    },
    required: ["requestedDiscountPct"],
  },

  // 8. simulate_supply_chain_dispatch
  simulate_supply_chain_dispatch: {
    type: "object",
    properties: {
      destinationZip: { type: "string", description: "Customer postal code (e.g. '94107')" },
      warehousePriority: {
        type: "string",
        enum: ["fastest_speed", "lowest_carbon", "balanced_cost"],
        description: "Routing optimization strategy",
      },
    },
    required: ["destinationZip"],
  },

  // 9. query_live_metrics
  query_live_metrics: {
    type: "object",
    properties: {
      metricType: {
        type: "string",
        enum: ["catalog_overview", "cart_state", "sustainability", "full_telemetry"],
        description: "Category of telemetry metrics to retrieve",
      },
    },
  },

  // 10. request_human_confirmation
  request_human_confirmation: {
    type: "object",
    properties: {
      action: { type: "string", description: "Action identifier (e.g. 'checkout_signoff')" },
      title: { type: "string", description: "Human-facing modal title" },
      details: { type: "string", description: "Breakdown for human review" },
      payload: { type: "object", description: "Optional metadata" },
    },
    required: ["action", "title", "details"],
  },

  // 11. execute_smart_checkout
  execute_smart_checkout: {
    type: "object",
    properties: {
      customerNotes: { type: "string", description: "Order instructions" },
      paymentMethod: {
        type: "string",
        enum: ["instant_escrow", "corporate_po", "apple_pay", "crypto_usdc"],
        description: "Payment or escrow vehicle",
      },
    },
  },

  // 12. trigger_ui_highlight
  trigger_ui_highlight: {
    type: "object",
    properties: {
      elementId: { type: "string", description: "DOM element ID to spotlight" },
      durationMs: { type: "number", minimum: 500, maximum: 15000, description: "Highlight duration in ms" },
    },
    required: ["elementId"],
  },

  // 13. stream_agent_activity (Supervision & Live Agent Trace)
  stream_agent_activity: {
    type: "object",
    properties: {
      activity: { type: "string", description: "Agent activity summary (e.g. '🔎 Searching catalog for keyboards under $200')" },
      phase: {
        type: "string",
        enum: ["DISCOVERY", "INSPECTION", "COMPARISON", "CUSTOMIZATION", "NEGOTIATION", "HUMAN_APPROVAL", "EXECUTION", "COMPLETED"],
        description: "Supervision lifecycle phase",
      },
      details: { type: "string", description: "Optional detailed telemetry or status notes" },
    },
    required: ["activity"],
  },

  // Backward compatible alias
  stream_agent_scratchpad: {
    type: "object",
    properties: {
      thought: { type: "string", description: "Agent intermediate reasoning text" },
      confidenceScore: { type: "number", minimum: 0, maximum: 1, description: "Confidence score" },
    },
    required: ["thought"],
  },

  // 14. set_app_theme
  set_app_theme: {
    type: "object",
    properties: {
      themeId: {
        type: "string",
        enum: ["dark_obsidian", "clean_light", "cyber_neon", "warm_editorial"],
        description: "Theme preset ID",
      },
    },
    required: ["themeId"],
  },
};

/**
 * Strict JSON Schema Validator
 * Validates arbitrary input against defined WebMCP Tool Schema
 */
export function validateToolArguments(toolName: string, input: any): ValidationResult {
  const errors: string[] = [];
  const schema = WEBMCP_TOOL_SCHEMAS[toolName];

  if (!schema) {
    return {
      valid: false,
      errors: [`Unrecognized tool '${toolName}'. No schema registered in WebMCP host.`],
      sanitizedArgs: {},
    };
  }

  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return {
      valid: false,
      errors: [`Input for '${toolName}' must be a JSON object, received ${Array.isArray(input) ? "array" : typeof input}`],
      sanitizedArgs: {},
    };
  }

  const sanitizedArgs: Record<string, any> = {};

  // 1. Check Required Properties
  if (schema.required) {
    for (const reqProp of schema.required) {
      if (input[reqProp] === undefined || input[reqProp] === null) {
        errors.push(`Tool '${toolName}' missing required property '${reqProp}'.`);
      }
    }
  }

  // 2. Validate Provided Properties
  for (const [propKey, propVal] of Object.entries(input)) {
    // Skip undefined or null optional properties
    if (propVal === undefined || propVal === null) {
      continue;
    }

    const propSchema = schema.properties[propKey];

    // Check if property is known in schema
    if (!propSchema) {
      // Allow extra metadata safely but note or copy it
      sanitizedArgs[propKey] = propVal;
      continue;
    }

    // Type validation
    if (propSchema.type === "number") {
      const parsedNumber = typeof propVal === "string" ? parseFloat(propVal.replace(/,/g, "")) : Number(propVal);
      if (isNaN(parsedNumber)) {
        errors.push(`Property '${propKey}' on tool '${toolName}' must be a valid number, received '${propVal}'.`);
        continue;
      }
      if (propSchema.minimum !== undefined && parsedNumber < propSchema.minimum) {
        errors.push(`Property '${propKey}' (${parsedNumber}) is below minimum limit (${propSchema.minimum}).`);
      }
      if (propSchema.maximum !== undefined && parsedNumber > propSchema.maximum) {
        errors.push(`Property '${propKey}' (${parsedNumber}) exceeds maximum limit (${propSchema.maximum}).`);
      }
      sanitizedArgs[propKey] = parsedNumber;
    } else if (propSchema.type === "string") {
      if (typeof propVal !== "string") {
        errors.push(`Property '${propKey}' on tool '${toolName}' must be a string, received ${typeof propVal}.`);
        continue;
      }
      if (propSchema.enum && !propSchema.enum.includes(propVal)) {
        errors.push(
          `Property '${propKey}' value '${propVal}' is not in allowed enum: [${propSchema.enum.join(", ")}].`
        );
      }
      sanitizedArgs[propKey] = propVal;
    } else if (propSchema.type === "boolean") {
      if (typeof propVal !== "boolean") {
        errors.push(`Property '${propKey}' on tool '${toolName}' must be a boolean, received ${typeof propVal}.`);
        continue;
      }
      sanitizedArgs[propKey] = propVal;
    } else if (propSchema.type === "array") {
      if (!Array.isArray(propVal)) {
        errors.push(`Property '${propKey}' on tool '${toolName}' must be an array, received ${typeof propVal}.`);
        continue;
      }
      if (propSchema.items && typeof propSchema.items === "object") {
        const itemType = (propSchema.items as any).type;
        if (itemType === "string") {
          const invalidItems = propVal.filter((i) => typeof i !== "string");
          if (invalidItems.length > 0) {
            errors.push(`Array '${propKey}' contains non-string elements.`);
          }
        } else if (itemType === "object") {
          const invalidObjects = propVal.filter((i) => !i || typeof i !== "object");
          if (invalidObjects.length > 0) {
            errors.push(`Array '${propKey}' contains invalid object elements.`);
          }
        }
      }
      sanitizedArgs[propKey] = propVal;
    } else if (propSchema.type === "object") {
      if (typeof propVal !== "object" || Array.isArray(propVal) || propVal === null) {
        errors.push(`Property '${propKey}' on tool '${toolName}' must be an object, received ${typeof propVal}.`);
        continue;
      }
      sanitizedArgs[propKey] = propVal;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedArgs,
  };
}
