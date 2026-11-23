Cath Lab Payment Tracker PWA repair

Upload/replace these files in the ROOT of your GitHub repository:
- manifest.json (replace)
- sw.js (replace)
- icon-192.png (add)
- icon-512.png (add)

Then edit index.html:
A) In <head>, ensure these lines are present (add them if absent):
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#123d50">

B) Before </body>, add:
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {scope: './'})
      .catch(err => console.warn('Service worker registration failed', err));
  });
}
</script>

Commit the changes. Wait for GitHub Pages to deploy, then on Android Chrome:
- Open the site
- Reload once
- Menu > Install app
If the old install prompt remains, clear the site cache or wait for the service worker to update.

Do not delete or reset the app's existing localStorage data. The tracker data is stored locally in each browser/device and is not synced automatically.
