import {withSentryConfig} from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSentryConfig(nextConfig, {
org: "discord-ty9",
project: "discord-web",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

release: {
    finalize: false
},

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Hides source maps from generated client bundles
hideSourceMaps: true,

webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
        enabled: true,
    },

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
        removeDebugLogging: true,
    },

    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
},
});
