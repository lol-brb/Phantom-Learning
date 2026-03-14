/**
 * Emails to block from using Phantom Learning.
 * Add one email per line (or keep as array entries).
 * Comparison is case-insensitive.
 * This file is the only source for block checks.
 */
window.BLOCKED_EMAILS = [
  "jpando31@krhs.net",
  "kirk.sarah@gmail.com"
];

window.isEmailBlocked = function(email) {
  if (!email || !window.BLOCKED_EMAILS || !Array.isArray(window.BLOCKED_EMAILS) || window.BLOCKED_EMAILS.length === 0) return false;
  var lower = String(email).trim().toLowerCase();
  if (!lower) return false;
  for (var i = 0; i < window.BLOCKED_EMAILS.length; i++) {
    var entry = window.BLOCKED_EMAILS[i];
    if (entry && String(entry).trim().toLowerCase() === lower) return true;
  }
  return false;
};
