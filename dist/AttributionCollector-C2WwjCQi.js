class AttributionCollector {
  /**
   * Collect attribution data from all available sources
   */
  async collect() {
    const metadata = this.collectMetadata();
    return {
      // Core attribution fields
      affiliate: this.getStoredValue("affid") || this.getStoredValue("aff") || "",
      funnel: this.getFunnelName(),
      gclid: this.getStoredValue("gclid") || "",
      // UTM parameters
      utm_source: this.getStoredValue("utm_source") || "",
      utm_medium: this.getStoredValue("utm_medium") || "",
      utm_campaign: this.getStoredValue("utm_campaign") || "",
      utm_content: this.getStoredValue("utm_content") || "",
      utm_term: this.getStoredValue("utm_term") || "",
      // Subaffiliates
      subaffiliate1: this.getStoredValue("subaffiliate1") || this.getStoredValue("sub1") || "",
      subaffiliate2: this.getStoredValue("subaffiliate2") || this.getStoredValue("sub2") || "",
      subaffiliate3: this.getStoredValue("subaffiliate3") || this.getStoredValue("sub3") || "",
      subaffiliate4: this.getStoredValue("subaffiliate4") || this.getStoredValue("sub4") || "",
      subaffiliate5: this.getStoredValue("subaffiliate5") || this.getStoredValue("sub5") || "",
      // Metadata
      metadata,
      // Timestamps
      first_visit_timestamp: this.getFirstVisitTimestamp(),
      current_visit_timestamp: Date.now()
    };
  }
  /**
   * Collect metadata including device info, referrer, and tracking data
   */
  collectMetadata() {
    const metadata = {
      landing_page: window.location.href,
      referrer: document.referrer || "",
      device: navigator.userAgent || "",
      device_type: this.getDeviceType(),
      domain: window.location.hostname,
      timestamp: Date.now(),
      // Facebook tracking
      fb_fbp: this.getCookie("_fbp") || "",
      fb_fbc: this.getCookie("_fbc") || "",
      fb_pixel_id: this.getFacebookPixelId()
    };
    const fbclid = this.getStoredValue("fbclid");
    if (fbclid) {
      metadata.fbclid = fbclid;
    }
    this.handleEverflowClickId(metadata);
    this.collectTrackingTags(metadata);
    return metadata;
  }
  /**
   * Get value from URL parameters, sessionStorage, or localStorage
   * Priority: URL > sessionStorage > localStorage
   */
  getStoredValue(key) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      const value = urlParams.get(key) || "";
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.error(`[AttributionCollector] Error storing ${key} in sessionStorage:`, error);
      }
      return value;
    }
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        return sessionValue;
      }
    } catch (error) {
      console.error(`[AttributionCollector] Error reading ${key} from sessionStorage:`, error);
    }
    try {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        return localValue;
      }
    } catch (error) {
      console.error(`[AttributionCollector] Error reading ${key} from localStorage:`, error);
    }
    try {
      const persistedData = localStorage.getItem("next-attribution");
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state[key]) {
          return parsed.state[key];
        }
      }
    } catch (error) {
      console.error("[AttributionCollector] Error reading persisted attribution:", error);
    }
    return "";
  }
  /**
   * Get cookie value by name
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || "";
    }
    return "";
  }
  /**
   * Detect device type based on user agent
   */
  getDeviceType() {
    const userAgent = navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) ? "mobile" : "desktop";
  }
  /**
   * Get funnel name from meta tag or campaign
   * Once a funnel is set, it persists and won't be overwritten
   */
  getFunnelName() {
    try {
      const sessionFunnel = sessionStorage.getItem("next_funnel_name");
      if (sessionFunnel) {
        console.debug(`[AttributionCollector] Using persisted funnel from session: ${sessionFunnel}`);
        return sessionFunnel;
      }
      const localFunnel = localStorage.getItem("next_funnel_name");
      if (localFunnel) {
        console.debug(`[AttributionCollector] Using persisted funnel from localStorage: ${localFunnel}`);
        sessionStorage.setItem("next_funnel_name", localFunnel);
        return localFunnel;
      }
      const persistedData = localStorage.getItem("next-attribution");
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state.funnel) {
          console.debug(`[AttributionCollector] Using persisted funnel from attribution: ${parsed.state.funnel}`);
          sessionStorage.setItem("next_funnel_name", parsed.state.funnel);
          localStorage.setItem("next_funnel_name", parsed.state.funnel);
          return parsed.state.funnel;
        }
      }
    } catch (error) {
      console.error("[AttributionCollector] Error reading persisted funnel:", error);
    }
    const funnelMetaTag = document.querySelector(
      'meta[name="os-tracking-tag"][data-tag-name="funnel_name"], meta[name="data-next-tracking-tag"][data-tag-name="funnel_name"], meta[name="next-funnel"]'
    );
    if (funnelMetaTag) {
      const value = funnelMetaTag.getAttribute("data-tag-value") || funnelMetaTag.getAttribute("content");
      if (value) {
        console.debug(`[AttributionCollector] New funnel found from meta tag: ${value}`);
        try {
          sessionStorage.setItem("next_funnel_name", value);
          localStorage.setItem("next_funnel_name", value);
          console.info(`[AttributionCollector] Persisted funnel name: ${value}`);
        } catch (error) {
          console.error("[AttributionCollector] Error persisting funnel name:", error);
        }
        return value;
      }
    }
    return "";
  }
  /**
   * Handle Everflow click ID tracking
   */
  handleEverflowClickId(metadata) {
    const urlParams = new URLSearchParams(window.location.search);
    let evclid = localStorage.getItem("evclid");
    if (urlParams.has("evclid")) {
      evclid = urlParams.get("evclid") || "";
      localStorage.setItem("evclid", evclid);
      sessionStorage.setItem("evclid", evclid);
      console.debug(`[AttributionCollector] Everflow click ID found in URL: ${evclid}`);
    } else if (!evclid && sessionStorage.getItem("evclid")) {
      evclid = sessionStorage.getItem("evclid");
      if (evclid) {
        localStorage.setItem("evclid", evclid);
        console.debug(`[AttributionCollector] Everflow click ID found in sessionStorage: ${evclid}`);
      }
    }
    if (urlParams.has("sg_evclid")) {
      const sg_evclid = urlParams.get("sg_evclid") || "";
      sessionStorage.setItem("sg_evclid", sg_evclid);
      localStorage.setItem("sg_evclid", sg_evclid);
      metadata.sg_evclid = sg_evclid;
      console.debug(`[AttributionCollector] SG Everflow click ID found: ${sg_evclid}`);
    } else {
      const storedSgEvclid = localStorage.getItem("sg_evclid");
      if (storedSgEvclid) {
        metadata.sg_evclid = storedSgEvclid;
      }
    }
    if (evclid) {
      metadata.everflow_transaction_id = evclid;
      console.debug(`[AttributionCollector] Added Everflow transaction ID to metadata: ${evclid}`);
    }
  }
  /**
   * Collect custom tracking tags from meta elements
   */
  collectTrackingTags(metadata) {
    const trackingTags = document.querySelectorAll(
      'meta[name="os-tracking-tag"], meta[name="data-next-tracking-tag"]'
    );
    console.debug(`[AttributionCollector] Found ${trackingTags.length} tracking tags`);
    trackingTags.forEach((tag) => {
      const tagName = tag.getAttribute("data-tag-name");
      const tagValue = tag.getAttribute("data-tag-value");
      const shouldPersist = tag.getAttribute("data-persist") === "true";
      if (tagName && tagValue) {
        metadata[tagName] = tagValue;
        console.debug(`[AttributionCollector] Added tracking tag: ${tagName} = ${tagValue}`);
        if (shouldPersist) {
          try {
            sessionStorage.setItem(`tn_tag_${tagName}`, tagValue);
            console.debug(`[AttributionCollector] Persisted tracking tag: ${tagName}`);
          } catch (error) {
            console.error(`[AttributionCollector] Error persisting tag ${tagName}:`, error);
          }
        }
      }
    });
  }
  /**
   * Try to detect Facebook Pixel ID from the page
   */
  getFacebookPixelId() {
    const pixelMeta = document.querySelector(
      'meta[name="os-facebook-pixel"], meta[name="facebook-pixel-id"]'
    );
    if (pixelMeta) {
      const pixelId = pixelMeta.getAttribute("content");
      if (pixelId) {
        console.debug(`[AttributionCollector] Facebook Pixel ID found from meta tag: ${pixelId}`);
        return pixelId;
      }
    }
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
      const content = script.textContent || "";
      if (content.includes("fbq(") && content.includes("init")) {
        const match = content.match(/fbq\s*\(\s*['"]init['"],\s*['"](\d+)['"]/);
        if (match && match[1]) {
          console.debug(`[AttributionCollector] Facebook Pixel ID found from script: ${match[1]}`);
          return match[1];
        }
      }
    }
    return "";
  }
  /**
   * Get the first visit timestamp
   */
  getFirstVisitTimestamp() {
    try {
      const persistedData = localStorage.getItem("next-attribution");
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state.first_visit_timestamp) {
          return parsed.state.first_visit_timestamp;
        }
      }
    } catch (error) {
      console.error("[AttributionCollector] Error reading first visit timestamp:", error);
    }
    return Date.now();
  }
}
export {
  AttributionCollector
};
