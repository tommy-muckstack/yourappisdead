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
  posthog.init(TOKEN, {
    api_host: HOST,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'always', // every visitor gets a person profile (geo, first referrer, first URL) so individuals are visible in PostHog
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
  });
  posthog.register({ product: 'yourappisdead', surface: 'hub', platform: 'web' });
  window.yad.track = (e, p) => posthog.capture(e, p);
  q.forEach(([e, p]) => posthog.capture(e, p));
})();
