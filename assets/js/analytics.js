/**
 * Google Analytics (GA4) Integration
 * Usage: Include this script in the <head> of any HTML page.
 * <script async src="/assets/js/analytics.js"></script>
 */

(function () {
    const GA_MEASUREMENT_ID = 'G-QPGFR1QP7Y';

    // Create the script tag for gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', GA_MEASUREMENT_ID);
})();
