/**
 * Changelog for the "What's new" / update popup.
 * Key = new Date().toDateString() for that day (e.g. "Thu Mar 05 2026").
 * When you ship changes: add a new key with that day's date and list the updates.
 * Optional: set "_latest" to the most recent changes; it's used when today has no entry.
 */
window.DAILY_CHANGELOG = {
  "_latest": [
    "Update popup shows accurate changes for the day",
    "Site version bumps when files change",
    "Block list and auto-update to sign-in on new version"
  ],
  "Thu Mar 05 2025": [
    "Square Dodge game added",
    "Circle Clicker game added",
    "Policy page and update log"
  ]
};
