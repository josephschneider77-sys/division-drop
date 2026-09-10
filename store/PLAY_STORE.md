# Division Drop → Google Play (free app)

Package ID: `com.josephschneider77.divisiondrop`  
Live PWA: https://josephschneider77-sys.github.io/division-drop/  
Privacy: https://josephschneider77-sys.github.io/division-drop/privacy.html

## 1. Create a Play Console account (~$25 once)

1. Go to https://play.google.com/console/signup
2. Pay the one-time registration fee with your Google account
3. Complete the developer profile (name, contact email)

## 2. Generate the Android App Bundle (AAB)

Easiest path (browser):

1. Open https://www.pwabuilder.com/
2. Enter `https://josephschneider77-sys.github.io/division-drop/`
3. Choose **Package for stores** → **Android**
4. Use package ID `com.josephschneider77.divisiondrop`
5. Download the zip (contains `.aab` for Play + `.apk` for testing)
6. Keep the signing key / keystore files PWABuilder gives you in a safe place

## 3. Digital Asset Links (removes the browser URL bar)

1. From the PWABuilder zip (or Play Console App signing), copy the **SHA-256** certificate fingerprint
2. Put it in `public/.well-known/assetlinks.json` replacing `REPLACE_WITH_UPLOAD_KEY_SHA256`
3. Rebuild / redeploy GitHub Pages so this URL returns JSON:
   https://josephschneider77-sys.github.io/division-drop/.well-known/assetlinks.json

Note: GitHub Pages serves the site under `/division-drop/`. Asset links for host `josephschneider77-sys.github.io` must be reachable at:
`https://josephschneider77-sys.github.io/.well-known/assetlinks.json`
(for the apex host) **or** configure the TWA host/path per PWABuilder’s Asset Links instructions. If verification fails, use the fingerprint file from the zip and follow PWABuilder’s “Asset Links” step exactly.

## 4. Create the Play listing

Use copy in `store/listing.md`.

You will need:
- App name: Division Drop
- Short description (80 chars)
- Full description
- App icon 512×512 (already in `icons/icon-512.png`)
- Feature graphic 1024×500
- Phone screenshots (at least 2)
- Privacy policy URL (above)
- Category: Education or Games / Educational
- Free / no ads / no IAP
- Target audience: include children only if you complete Play’s Families / Designed for Families requirements; otherwise mark age appropriately and keep the app free of ads and social features (current build has none)

## 5. Upload & submit

1. Play Console → Create app → Division Drop
2. Set free
3. Complete Dashboard tasks (store listing, content rating questionnaire, target audience, news apps declaration, Data safety)
4. **Data safety:** no collected personal data; local game progress only on device
5. Upload the `.aab` to Production (or Internal testing first — recommended)
6. Roll out Internal testing → add your Gmail as tester → install from Play and verify
7. Promote to Production when happy

## 6. After approval

Share the Play Store link. Kids install from Play like any free app.
