// Redirects to login if user is not authenticated.
// Include this script on all admin-only pages AFTER firebase-init.js
function requireAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      const redirect = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
      window.location.href = `login.html?redirect=${redirect}`;
    }
  });
}
requireAuth();
