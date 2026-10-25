/**
 * Real User Monitoring (RUM) for CamGO Business.
 * Collects LCP, INP, CLS, TTFB, FCP and reports to POST /api/v1/metrics/vitals.
 * - Sample rate: 20%
 * - Zero personal data
 * - Non-blocking beacon transmission (sendBeacon / keepalive)
 */

const SAMPLE_RATE = 0.2; // 20% sampling
const ENDPOINT = '/api/v1/metrics/vitals';

function getDeviceType() {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getEffectiveType() {
  if (typeof navigator === 'undefined') return 'unknown';
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return conn?.effectiveType || 'unknown';
}

function rateMetric(name, value) {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

function sendMetric(metric, value) {
  if (Math.random() > SAMPLE_RATE) return;

  const payload = {
    metric,
    value: Number(value.toFixed(4)),
    rating: rateMetric(metric, value),
    route: window.location.pathname || '/',
    device_type: getDeviceType(),
    effective_type: getEffectiveType(),
    app_version: '1.0.0',
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(ENDPOINT, blob);
  } else {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function initWebVitals() {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  // 1. TTFB (Navigation Timing)
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      const ttfb = nav.responseStart - nav.requestStart;
      if (ttfb > 0) {
        sendMetric('TTFB', ttfb);
      }
    }
  } catch (e) {}

  // 2. FCP
  try {
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          sendMetric('FCP', entry.startTime);
          paintObserver.disconnect();
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {}

  // 3. LCP
  try {
    let lastLcp = 0;
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        lastLcp = entries[entries.length - 1].startTime;
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && lastLcp > 0) {
        sendMetric('LCP', lastLcp);
        lcpObserver.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
  } catch (e) {}

  // 4. CLS
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    const onClsReport = () => {
      if (document.visibilityState === 'hidden') {
        sendMetric('CLS', clsValue);
        clsObserver.disconnect();
        document.removeEventListener('visibilitychange', onClsReport);
      }
    };
    document.addEventListener('visibilitychange', onClsReport);
  } catch (e) {}
}

export default initWebVitals;
