# Analytics taxonomy (PostHog)

One PostHog project (**666931**, US cloud) is shared by the hub site and every IsDead app. This file is the taxonomy every app follows, so the project stays queryable as apps are added.

## 1. Super properties (set on every event, every app)

Register these once at init with `posthog.register()`:

| property  | hub value         | sub-app value                      | notes |
|-----------|-------------------|------------------------------------|-------|
| `product` | `yourappisdead`   | the app slug, e.g. `calendlyisdead` | the one property you always filter by |
| `surface` | `hub`             | `landing` or `app`                 | marketing page vs the working app |
| `platform`| `web`             | `web`, `mac`, `ios`, `android`     | runtime, not browser |

Pageviews are PostHog's built-in `$pageview`. Autocapture is **off** everywhere; every event below is explicit.

**The cookie is shared.** Every app is served from yourappisdead.com, and PostHog keeps super properties in one persisted
store per origin and token, so whatever one app registers rides along on the next app's events. At init every app must
(1) `unregister` the legacy keys `app`, `app_family`, `base_path`, `suite_id`, `app_id`, `schema_version`, `source`,
`site_id`, `environment`, `ads_blocked` (hub-only; the hub re-registers it), `account_type` (each app sets its own), then (2) `register` its own `product`/`surface`/`platform`, and (3) re-register them after
`reset()` (sign-out), which wipes them. Never register any other super property except `env` and `account_type` (and the hub's `ads_blocked`). A
per-event `surface` must use the same values (`landing`/`app`), since it overrides the super property.

All web apps use the same publishable key (Vercel env `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`, set on every
IsDead Vercel project) and proxy through `/<slug>/ingest`. A drop-in Next.js implementation is in
linktreeisdead `lib/analytics/` (`taxonomy.ts`, `posthog.tsx`).

## 2. Event names

`<area>_<object>_<action>`, snake_case, past tense for the action. Keep the object a noun and the action a verb that already happened.

Areas:

| area      | owner      | what it covers |
|-----------|------------|----------------|
| `hub`     | this repo  | the marketplace pages: search, filters, tiles, contribute, request form |
| `arcade`  | this repo  | the games on the hub |
| `app`     | every sub-app | the working product: signup, core actions, upgrade/paywall-free moments. Same names across apps, disambiguated by `product` |
| `landing` | every sub-app | the app's own marketing page: CTA clicks, downloads |

Sub-apps should use the generic `app_*` names where one fits (`app_signed_up`, `app_signed_in`, `app_<object>_created`, `app_shared`) and only invent `app_<object>_<action>` names for product-specific actions. Never put the product name in the event name; it is already in `product`.

## 3. Shared property names

Reuse these exact keys so cross-app insights line up:

| key            | type   | used for |
|----------------|--------|----------|
| `app_slug`     | string | which listed app a hub event is about (`calendlyisdead`) |
| `app_status`   | string | `live`, `soon`, `community` |
| `position`     | int    | index in a list, 0-based |
| `channel`      | string | share destination: `x`, `linkedin`, `facebook` |
| `message_id`   | int    | which share line was used (index into EPITAPHS in app.js) |
| `closer_id`    | int    | which closing line sent them to the hub (index into CLOSERS in app.js) |
| `target`       | string | where a link/CTA goes: `github`, `contributing`, `apps`, `arcade`, … |
| `query_length` | int    | characters typed; never the query text |
| `results_count`| int    | |
| `game`         | string | `slayer`, `breaker`, `invaders`, `bird`, `snake` |
| `score`        | int    | |
| `duration_s`   | int    | seconds in a session/round |
| `is_new_best`  | bool   | |
| `input`        | string | `keyboard`, `touch` |
| `ads_blocked`  | bool   | super property on the hub once checked: the browser couldn't reach AdSense (ad blocker, DNS filter) |

## 4. Hub events (implemented in this repo)

| event                        | properties |
|------------------------------|------------|
| `hub_search_performed`       | `query_length`, `results_count` (debounced, fires once per pause in typing) |
| `hub_app_opened`             | `app_slug`, `app_status`, `position` |
| `hub_app_repo_clicked`       | `app_slug` |
| `hub_app_shared`             | `app_slug`, `channel`, `message_id` + `closer_id` (X only) |
| `hub_nav_clicked`            | `target` |
| `hub_contribute_clicked`     | `target` (`contributing`, `all_repos`, `site_repo`) |
| `hub_app_requested`          | `wants_to_build` (`no`, `yes`, `maybe`); never the form text |
| `hub_consent_link_clicked`   | `target` (`settings` = Privacy & cookie settings, `optout` = Do Not Sell or Share) |
| `hub_consent_updated`        | `gdpr_applies`, `ads_storage` (TCF purpose 1), `ads_personalized` (purposes 3+4); fired when a visitor completes Google's consent message |
| `hub_ads_checked`            | `ads_blocked`; once per browser session |
| `arcade_game_selected`       | `game` |
| `arcade_game_started`        | `game`, `input` |
| `arcade_game_over`           | `game`, `score`, `duration_s`, `is_new_best` |
| `arcade_score_saved`         | `game`, `score` (Slayer initials board) |
| `arcade_score_shared`        | `game`, `score`, `channel` |

## 5. Privacy rules

- No free text from users (search queries, form fields, initials) is ever sent. Lengths and enums only.
- Identity, best effort without a login: `person_profiles: 'always'` so every visitor is a person in PostHog with their history, first referrer and GeoIP. The id is a first-party cookie + localStorage on yourappisdead.com, shared by the hub and every app, so one person is one id from the hub into the apps and across return visits on that browser. Apps call `posthog.identify(uid)` on sign-in, which merges the anonymous history and links devices. No browser fingerprinting (unreliable on Safari/Firefox/Brave, needs consent in the EU/UK). The dashboard's "Hub: approximate people" tile additionally bridges cleared cookies by counting distinct IP + OS + browser, server-side, as an estimate only.
- Session replay is off at the SDK level on the hub.
- Ads: AdSense (Auto ads) runs on the hub only, with consent handled by Google's own messages. Ad revenue lives in AdSense, not PostHog; PostHog only records whether ads can load (`ads_blocked`) and the consent outcome, never TCF strings or vendor lists.
- Analytics is skipped on `localhost` and when the browser sends Do Not Track.

## 6. Adding PostHog to a sub-app (checklist)

Copy linktreeisdead `lib/analytics/` (Next.js) — it already does all of this:

1. Init with the shared token through the app's own proxy (`/<slug>/ingest` → `us.i.posthog.com`), `autocapture: false`,
   `capture_pageview: false` (send `$pageview` per route), `disable_session_recording`, `capture_heatmaps: false`,
   `capture_performance: false`, `person_profiles: 'always'` (same as the hub).
2. Unregister the legacy keys, then `register({ product: '<slug>', surface: 'landing' | 'app', platform: '<runtime>' })`; re-register after `reset()`.
3. `before_send: scrub` — every key ending in `url`/`referrer`/`pathname` (top level and in `$set`/`$set_once`, also nested
   under `properties`) keeps origin + path only, secret path segments are masked to `:id`, and `title` is dropped.
4. Use `app_*` / `landing_*` names from section 2 and the keys from section 3. Never name an event property `source`, `app`,
   `app_id`, `site_id` or `environment` (legacy super-property keys).
5. List the app's events in its own `docs/ANALYTICS.md`, and add the app to the index below.

### Sub-app index (event tables live in each repo's `docs/ANALYTICS.md`)

| product | web surfaces (`app`) | masked paths | notable events |
|---|---|---|---|
| airtableisdead | `/app` | — | `app_table_*`, `app_record_*`, `app_view_created`, `app_csv_*` |
| bitlyisdead | `/app`, `/p`, `/s`, `/api/qr` | — | `app_link_*`, `app_qr_*`, `app_page_*`, `app_campaign_created` (kit in `lib/telemetry/`) |
| calendlyisdead | everything but `/`, `/pricing`, `/login`, `/signup` | `/booking`, `/pay`, `/invite`, `/meet`, `/poll`, `/f` | `app_event_type_*`, `app_booking_*`, `app_poll_*` (kit in `lib/posthog/`) |
| canvaisdead | `/app` | design ids | `app_design_*`, `app_template_applied` — opt-in consent: loads only after the visitor allows analytics |
| cleanshotxisdead | `/app`, `/s` | `/s/:id` | `landing_download_clicked`, `app_capture_taken`, `app_shot_viewed`; Mac: section 7 |
| docusignisdead | `/app`, `/sign` | `/sign/:id` | `app_envelope_*`, `app_document_signed` / `_declined` |
| granolaisdead | — (site only) | — | `landing_download_clicked`; Mac app has its own Swift events |
| grammarlyisdead | `/app` | — | `app_document_*`, `app_suggestion_*` |
| linearisdead | `/app` | — | section 8 |
| linktreeisdead | `/app`, `/u`, `/go`, `/s` | editor ids | `app_block_*`, `app_theme_applied`, `app_profile_*` |
| loomisdead | `/v` | `/v/:id` | `landing_download_clicked`, `app_recording_*`, `app_reaction_added` |
| miroisdead | `/app`, `/b` | board ids | `app_board_*`, `app_shared` |
| notionisdead | `/app` | page ids (`/app/:id`) | `app_page_*`, `app_shared` |
| onepasswordisdead | `/app` | everything under `/app` | `app_vault_*`, `app_item_*` (`item_kind` only — no counts or contents) |
| otterisdead | `/app` | — | `app_recording_started`, `app_conversation_*` |
| superhumanisdead | — (site only) | — | `landing_cta_clicked`, sign-in events |
| trelloisdead | `/app` | `/app/join`, `/app/b`, `/app/w` | `app_board_created`, `app_card_*`, `app_list_created` |
| typeformisdead | `/app`, `/f` | form ids | `app_form_*`, `app_form_response_submitted` |
| wetransferisdead | `/app`, `/t` | `/t/:id` | `app_transfer_*`, `app_shared` |
| wisprflowisdead | `/demo`, `/app` | — | `landing_download_clicked`, `app_dictation_*` |

## 7. Mac app events (cleanshotxisdead, `platform: mac`)

The native Mac app sends the same super properties plus `app_version`, `app_build`, `os_version`, with `$process_person_profile: false` (anonymous device id, no person profiles). Nothing is sent from dev builds.

| event                          | properties |
|--------------------------------|------------|
| `app_opened`                   | (launch) |
| `app_settings_opened`          | |
| `app_capture_taken`            | `kind` (`area`, `window`, `fullscreen`, `timer`, `previous_area`, `scrolling`), `mode` (`capture`, `copy`, `save`, `upload`, `annotate`, `pin`) |
| `app_scrolling_capture_started`| |
| `app_scrolling_capture_saved`  | `sections` |
| `app_recording_started`        | `mode` (`video`, `gif`), `mic`, `system_audio` |
| `app_recording_saved`          | `format` (`mp4`, `gif`) |
| `app_editor_opened`            | |
| `app_editor_saved`             | `annotations`, `backdrop`, `cutout`, `corner_radius` |
| `app_editor_text_copied`       | `chars` (count only) |
| `app_editor_background_removed`| |
| `app_shared`                   | `channel` (`cloud`) |

## 8. LinearIsDead events (`product: linearisdead`, `platform: web`)

`identify(uid)` only for signed-in Firebase accounts; guests and the demo account stay anonymous (`account_type` super property).

| event                     | properties |
|---------------------------|------------|
| `landing_cta_clicked`     | `target` (`nav_login`, `nav_signup`, `footer_get_started`) |
| `app_signed_in`           | `method` (`email`, `google`) |
| `app_signed_up`           | `method` (`email`, `google`) |
| `app_issue_created`       | `priority` (0–4), `has_project`, `has_assignee` |
| `app_issue_updated`       | `field` (`status`, `priority`, `assignee`, `labels`, `projectId`, `cycleId`, `estimate`, `title`, `description`), `count` |
| `app_issues_deleted`      | `count` |
| `app_comment_added`       | |
| `app_project_created`     | |
| `app_cycle_rolled_over`   | `count` (issues moved) |
| `app_command_menu_opened` | |
| `app_layout_changed`      | `layout` (`list`, `board`) |
