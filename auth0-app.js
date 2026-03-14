(function () {
  var c = window.AUTH0_CONFIG;
  if (!c || !c.domain || !c.clientID) {
    showEl("error");
    document.getElementById("error-details").textContent =
      "Missing Auth0 config (domain, clientID). Set AUTH0_CONFIG in the page.";
    return;
  }

  var auth0 = new window.auth0.WebAuth({
    domain: c.domain,
    clientID: c.clientID,
    redirectUri: c.redirectUri,
    responseType: c.responseType || "token id_token",
    scope: c.scope || "openid profile email"
  });

  var loading = document.getElementById("loading");
  var error = document.getElementById("error");
  var errorDetails = document.getElementById("error-details");
  var app = document.getElementById("app");
  var loggedOut = document.getElementById("logged-out");
  var loggedIn = document.getElementById("logged-in");
  var loginBtn = document.getElementById("login-btn");
  var logoutBtn = document.getElementById("logout-btn");
  var profileEl = document.getElementById("profile");

  function showEl(id) {
    loading.style.display = "none";
    error.style.display = "none";
    app.style.display = "none";
    if (id === "loading") loading.style.display = "block";
    else if (id === "error") {
      error.style.display = "block";
    } else {
      app.style.display = "flex";
    }
  }

  function showError(msg) {
    errorDetails.textContent = msg || "Unknown error";
    showEl("error");
  }

  function showLoggedOut() {
    loggedOut.style.display = "flex";
    loggedIn.style.display = "none";
    showEl("app");
  }

  function showLoggedIn(user) {
    loggedOut.style.display = "none";
    loggedIn.style.display = "flex";
    var placeholder =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E";
    profileEl.innerHTML =
      "<div style='display:flex;flex-direction:column;align-items:center;gap:1rem'>" +
      "<img src=\"" +
      (user.picture || placeholder) +
      "\" alt=\"" +
      (user.name || "User") +
      "\" class=\"profile-picture\" style=\"width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid #63b3ed\" onerror=\"this.src='" +
      placeholder +
      "'\" />" +
      "<div style='text-align:center'>" +
      "<div class=\"profile-name\" style=\"font-size:2rem;font-weight:600;color:#f7fafc;margin-bottom:0.5rem\">" +
      (user.name || "User") +
      "</div>" +
      "<div class=\"profile-email\" style=\"font-size:1.15rem;color:#a0aec0\">" +
      (user.email || "No email provided") +
      "</div>" +
      "</div></div>";
    showEl("app");
  }

  function init() {
    if (window.location.hash) {
      auth0.parseHash(function (err, result) {
        if (err) {
          showError(err.error || err.errorDescription || err.message || JSON.stringify(err));
          return;
        }
        if (result && result.idTokenPayload) {
          var user = {
            name: result.idTokenPayload.name,
            email: result.idTokenPayload.email,
            picture: result.idTokenPayload.picture
          };
          window.history.replaceState(null, document.title, window.location.pathname);
          showLoggedIn(user);
          return;
        }
        if (result && result.accessToken) {
          auth0.client.userInfo(result.accessToken, function (err, user) {
            if (err) {
              showError(err.message || "Failed to load profile");
              return;
            }
            window.history.replaceState(null, document.title, window.location.pathname);
            showLoggedIn(user);
          });
          return;
        }
        showLoggedOut();
      });
    } else {
      showLoggedOut();
    }
  }

  loginBtn.addEventListener("click", function () {
    auth0.authorize();
  });

  logoutBtn.addEventListener("click", function () {
    auth0.logout({
      returnTo: window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/index.html"),
      clientID: c.clientID
    });
  });

  init();
})();
