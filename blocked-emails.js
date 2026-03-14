/**
 * Emails to block from using Phantom Learning.
 * Add or remove emails anytime; the list is re-loaded on each sign-in.
 * Comparison is case-insensitive.
 */
window.BLOCKED_EMAILS = [
  "jpando31@krhs.net"
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
