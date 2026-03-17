/**
 * Changelog for the "What's new" / update popup.
 * Only TODAY and TOMORROW are shown. Keys = date from toDateString() (e.g. "Thu Mar 06 2026").
 * When you deploy: add a key for today and a key for tomorrow with the same or different list.
 * In console: new Date().toDateString() → today; copy and add 1 day for tomorrow.
 */
window.DAILY_CHANGELOG = {
  "Thu Mar 05 2025": [
    "Square Dodge game added",
    "Circle Clicker game added",
    "Policy page and update log"
  ],
  "Fri Mar 06 2025": [
    "Update popup shows today and tomorrow only",
    "Site version bumps when files change"
  ]
};
