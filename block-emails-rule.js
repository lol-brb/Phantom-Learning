/**
 * Auth0: Block specific emails at login
 *
 * --- OPTION A: Classic Rules (Authentication → Rules → Create Rule) ---
 * Paste the blockEmails function below. UnauthorizedError is built-in.
 *
 * --- OPTION B: Actions (Actions → Library → Build Custom → Login flow) ---
 * Use the onExecutePostLogin version in the Auth0 Action editor.
 */

// ----- Rules (classic) -----
function blockEmails(user, context, callback) {
  const blockedEmails = [
    "blocked@example.com",
    "testuser@gmail.com"
  ];

  if (blockedEmails.includes(user.email)) {
    return callback(new UnauthorizedError("Your email is not allowed."));
  }

  callback(null, user, context);
}

// ----- Actions (Post Login) — use this in Actions → Flows → Login -----
// exports.onExecutePostLogin = async (event, api) => {
//   const blockedEmails = [
//     "blocked@example.com",
//     "testuser@gmail.com"
//   ];
//   if (blockedEmails.includes(event.user.email)) {
//     api.access.deny("Your email is not allowed.");
//   }
// };
