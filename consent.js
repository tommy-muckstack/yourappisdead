// Footer consent links. Google's consent messages (AdSense Privacy & messaging) do the work;
// these just reopen them: the GDPR message for EEA/UK/CH visitors, the opt-out dialog for covered US states.
(() => {
  const queue = () => {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    return window.googlefc.callbackQueue;
  };
  const open = {
    settings: () => queue().push(() => googlefc.showRevocationMessage()),
    // usstatesoptout is only defined where Google shows the US-states message; elsewhere this does nothing.
    optout: () => queue().push({ CONSENT_API_READY: () => googlefc.usstatesoptout?.openConfirmationDialog?.(() => {}) }),
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-consent]');
    if (!b || !open[b.dataset.consent]) return;
    open[b.dataset.consent]();
    window.yad?.track('hub_consent_link_clicked', { target: b.dataset.consent });
  });
})();
