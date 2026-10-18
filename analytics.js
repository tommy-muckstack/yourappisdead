// PostHog for the hub. Taxonomy lives in ANALYTICS.md; keep event names and property keys in sync with it.
(() => {
  const TOKEN = 'phc_nrzr9eEcwg6H89hkh4DmBU4nL9ntSArzQXV2SR2vaE2F'; // publishable project token, US cloud
  const HOST = 'https://us.i.posthog.com';
  const off = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || navigator.doNotTrack === '1';
  const q = [];
  // window.yad.track(event, props) is the only API the rest of the site uses.
  window.yad = { track: (e, p) => { if (off) return; q.push([e, p]); } };
  if (off) return;
  // Official snippet (posthog-js via CDN), trimmed.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing is_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  const HUB_PROPS = { product: 'yourappisdead', surface: 'hub', platform: 'web' };
  const LEGACY_PROPS = ['app', 'app_family', 'base_path', 'suite_id', 'app_id', 'schema_version', 'source', 'site_id', 'environment', 'env', 'account_type'];
  posthog.init(TOKEN, {
    api_host: HOST,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'always', // every visitor gets a person profile (geo, first referrer, first URL) so individuals are visible in PostHog
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
    // Every IsDead app runs on this origin and shares the persisted super properties, so clear what sub-apps (or their
    // older taxonomies) left behind before the first pageview goes out, then set the hub's own.
    // Privacy: URL properties keep origin + path only (query strings can carry search text), and page titles are dropped.
    before_send: e => {
      const clean = v => (typeof v === 'string' && v !== '$direct' ? v.split(/[?#]/)[0] : v);
      // every url/referrer/pathname key posthog-js adds ($session_entry_url, $initial_referrer, …), top level and nested
      const props = e && e.properties;
      for (const bag of [props, e && e.$set, e && e.$set_once, props && props.$set, props && props.$set_once]) {
        if (bag && typeof bag === 'object') for (const k of Object.keys(bag)) if (/(url|referrer|pathname)$/i.test(k)) bag[k] = clean(bag[k]);
      }
      if (e && e.properties) delete e.properties.title;
      return e;
    },
    loaded: ph => { LEGACY_PROPS.forEach(k => ph.unregister(k)); ph.register(HUB_PROPS); },
  });
  posthog.register(HUB_PROPS);
  window.yad.track = (e, p) => posthog.capture(e, p);

  // Ads: can this browser reach AdSense at all? Checked once per session; ads_blocked rides on later events
  // so traffic can be split into visitors who can and can't see ads.
  let checked = false;
  try { checked = sessionStorage.getItem('yad.adcheck') === '1'; sessionStorage.setItem('yad.adcheck', '1'); } catch {}
  if (!checked) {
    fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3018137267540474', { method: 'HEAD', mode: 'no-cors' })
      .then(() => false, () => true)
      .then(blocked => { posthog.register({ ads_blocked: blocked }); posthog.capture('hub_ads_checked', { ads_blocked: blocked }); });
  }

  // Google's GDPR consent message speaks TCF v2. Record the choice when a visitor makes one; the CMP only
  // loads for visitors it applies to, so give up quietly if it never appears.
  const watchConsent = (tries = 0) => {
    if (typeof window.__tcfapi !== 'function') { if (tries < 30) setTimeout(() => watchConsent(tries + 1), 1000); return; }
    window.__tcfapi('addEventListener', 2, (d, ok) => {
      if (!ok || d.eventStatus !== 'useractioncomplete') return;
      const c = (d.purpose && d.purpose.consents) || {};
      posthog.capture('hub_consent_updated', { gdpr_applies: !!d.gdprApplies, ads_storage: !!c[1], ads_personalized: !!(c[3] && c[4]) });
    });
  };
  watchConsent();
  q.forEach(([e, p]) => posthog.capture(e, p));
})();
