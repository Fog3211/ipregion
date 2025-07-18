// Google Analytics configuration and utilities
export const GA_TRACKING_ID = 'G-EZ39YFQRBE';

// Initialize Google Analytics
export const gtag = (...args: any[]) => {
  (window as any).gtag = (window as any).gtag || function() {
    ((window as any).gtag.q = (window as any).gtag.q || []).push(arguments);
  };
  (window as any).gtag(...args);
};

// Page view tracking
export const pageview = (url: string) => {
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Event tracking
export const event = (action: string, parameters?: {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}) => {
  gtag('event', action, parameters);
};

// Specific events for this app
export const trackIpGeneration = (country: string, count: number, success: boolean) => {
  event('generate_ip', {
    event_category: 'ip_generation',
    event_label: country,
    value: count,
    custom_parameters: {
      country,
      count,
      success,
    },
  });
};

export const trackCountrySearch = (query: string) => {
  event('search_country', {
    event_category: 'user_interaction',
    event_label: query,
    custom_parameters: {
      search_term: query,
    },
  });
};

export const trackIpCopy = (ip: string, batch: boolean = false) => {
  event('copy_ip', {
    event_category: 'user_interaction', 
    event_label: batch ? 'batch_copy' : 'single_copy',
    custom_parameters: {
      ip: batch ? 'multiple' : ip,
      is_batch: batch,
    },
  });
}; 