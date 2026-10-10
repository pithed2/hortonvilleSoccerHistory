# Website risk and accessibility review

Review date: October 9, 2026. Operator supplied by Andrew Montalbano: Andrew Montalbano, andrewmmontalbano@gmail.com, Hortonville, WI 54944.

This is an implementation review, not a legal clearance, a copyright license, or a WCAG conformance certification. Changes are local until deployed.

## Implemented

- Privacy, terms, cookie, accessibility, and contact pages linked in the shared footer.
- Site-wide Vercel Analytics removed. CSP blocks external frames, external scripts, and external browser connections. Inline scripts remain necessary for the current Next.js rendering setup.
- Social, map, and recruiting services are outbound links. Weather queries run server-side against Open-Meteo using game locations; browser visitor data is not sent by that weather code.
- Placeholder gallery withdrawn from display; unsupported claim of thousands of album photos removed. Other historical photos/logos remain pending permissions review.
- Coach sign-in discloses its cookie and links policies; player-game sign-in discloses storage and age restriction. Upload notice discourages sensitive records. Existing photo-rights checkbox now mentions subject/guardian permissions; review-copy release remains server-validated and coach-restricted.
- Keyboard dropdown toggle, Escape dismissal, focus styles for form inputs, skip-link targets, focusable scrolling statistics tables, brighter dark-background headings and muted text, and reduced-motion styles.
- Recruiting assessment remains browser-only with privacy notice; answers are not submitted to the server. It already uses labels, fieldsets, keyboard-native inputs, and focus management.

## Requires operator decisions / evidence

1. Complete image-rights-inventory.csv. All 48 public image assets are UNVERIFIED because no license evidence has been supplied. Record copyright owner, source, permitted uses, dates, proof, and any subject/guardian or district permission. A photo on Google, a school's site, or social media is not proof of permission. Logos also need trademark/affiliation review. Static files remain directly accessible even when no longer shown in the gallery; remove assets from the deployed public directory if no permission can be established.
2. Operator confirmed this is an independent community website; an affiliation notice is published. Reassess obligations if it becomes district-operated.
3. Operator confirmed all assigned Red Room users are 13+ and name/game use is authorized. Keep evidence and verify future assigned users. An age statement does not resolve COPPA if the actual audience or knowledge triggers it. Do not issue under-13 accounts until the applicable parental-consent process has been legally reviewed.
4. Define and implement retention/deletion for account/game records, player drafts, correspondence, hosting logs, and backups. Current policy candidly describes indefinite records pending review; it does not invent automatic deletion. Session expiry is not database deletion.
5. Confirm production hosting/database/email vendors, processor contracts, access controls, log retention, provider-side analytics settings, and breach response. Application-code inspection cannot certify hosting dashboard configuration.
6. Review player-card sample photographs in data/player-card-examples separately; the inventory covers public assets, not database uploads or private sample sources. Retain documentary permission evidence outside the public site.
7. Confirm any commercial activity, targeted foreign audience, fundraising, merchandise, or sponsor relationships before adding features. Jurisdiction and obligations depend on real operations, not only a ZIP code.

## Legal sources and scope

- U.S. Copyright Office: https://www.copyright.gov/engage/docs/photography.pdf — permission from photograph copyright owners.
- FTC COPPA guidance: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions — under-13 collection and actual knowledge; assess game audience rather than relying only on a checkbox.
- U.S. Department of Education: https://studentprivacy.ed.gov/faq/faqs-photos-and-videos-under-ferpa — student photos, directory-information designations, school consent and opt-outs where applicable.
- DOJ ADA guidance: https://www.ada.gov/resources/web-guidance/ — accessibility obligations; https://www.ada.gov/resources/small-entity-compliance-guide/ — government entities and WCAG requirements if school/district operated.
- Wisconsin DATCP breach guidance: https://datcp.wi.gov/Pages/Publications/IDTheftDataBreach607.aspx — assesses covered personal information and Wisconsin breach-notification duties. Wisconsin DPI student-record guidance: https://dpi.wi.gov/sites/default/files/imce/sped/pdf/sspw-student-records-confidentiality.pdf.
- Wisconsin statutes to have counsel assess: 995.50 (privacy and name/image use), 118.125 (pupil records if school-related), 134.98 (breach notification), and 100.18 (misleading representations where applicable). Legislature pages could not be retrieved in this research session; applicability and current statutory text require confirmation, not an assertion of compliance.
- ICO cookie guidance: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/ — relevant if UK rules apply. Necessary authentication is distinct from optional tracking. Current implementation removes optional tracking instead of presenting a meaningless banner; reassess before introducing tracking/embeds.

## Validation

TypeScript passes. Production build passes (140 pages). Full-repository lint has pre-existing script/temp errors; lint of application and edited components passes with one existing image-element performance warning. Final browser checks: 28 desktop routes and 11 mobile layouts returned HTTP 200 with zero axe WCAG A/AA violations. Desktop request monitoring found no external browser requests. Skip link, desktop dropdown Enter/Escape, mobile toggle, recruiting question progression/focus, and coach form keyboard navigation passed. Results are recorded in accessibility-browser-results.json and form-keyboard-results.json. Production preview is available locally on port 3100 while the preview server runs. Automated checks do not replace keyboard/screen-reader/manual review of every state, private tool, game, or downloadable document.
