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
| `message_id`   | int    | which share message template was used (index into the epitaph list in app.js) |
| `target`       | string | where a link/CTA goes: `github`, `contributing`, `apps`, `arcade`, … |
| `query_length` | int    | characters typed; never the query text |
| `results_count`| int    | |
| `game`         | string | `slayer`, `breaker`, `invaders`, `bird`, `snake` |
| `score`        | int    | |
| `duration_s`   | int    | seconds in a session/round |
| `is_new_best`  | bool   | |
| `input`        | string | `keyboard`, `touch` |

## 4. Hub events (implemented in this repo)

| event                        | properties |
|------------------------------|------------|
| `hub_search_performed`       | `query_length`, `results_count` (debounced, fires once per pause in typing) |
| `hub_app_opened`             | `app_slug`, `app_status`, `position` |
| `hub_app_repo_clicked`       | `app_slug` |
| `hub_app_shared`             | `app_slug`, `channel`, `message_id` |
| `hub_nav_clicked`            | `target` |
| `hub_contribute_clicked`     | `target` (`contributing`, `all_repos`, `site_repo`) |
| `hub_app_requested`          | `wants_to_build` (`no`, `yes`, `maybe`); never the form text |
| `arcade_game_selected`       | `game` |
| `arcade_game_started`        | `game`, `input` |
| `arcade_game_over`           | `game`, `score`, `duration_s`, `is_new_best` |
| `arcade_score_saved`         | `game`, `score` (Slayer initials board) |
| `arcade_score_shared`        | `game`, `score`, `channel` |

## 5. Privacy rules

- No free text from users (search queries, form fields, initials) is ever sent. Lengths and enums only.
- `person_profiles: 'identified_only'`: the hub never identifies anyone, so visitors stay anonymous. Sub-apps call `posthog.identify()` only after sign-in.
- Session replay is off at the SDK level on the hub.
- Analytics is skipped on `localhost` and when the browser sends Do Not Track.

## 6. Adding PostHog to a sub-app (checklist)

1. Init with the shared token and `https://us.i.posthog.com`, `autocapture: false`, `person_profiles: 'identified_only'`.
2. `posthog.register({ product: '<slug>', surface: 'app' | 'landing', platform: '<runtime>' })` right after init.
3. Use `app_*` / `landing_*` names from section 2 and the keys from section 3.
4. Add a row to this file for any new event name before shipping it.
