# Piano scheduler

A scheduling app for piano lesson students: monthly calendar, a 15-minute
daily grid, and a student roster with reschedule/makeup tracking.

## What's built so far

- Monthly calendar (tap a date to open the daily view)
- Daily view, 9:00am-9:30pm, 15-minute grid, color-coded (green = open,
  blue = scheduled, amber = blocked)
- Student list (alphabetical, with "makeup owed" badges) + add/edit form
- Firestore data layer for students, recurring weekly lessons, and
  one-off schedule exceptions (cancellations, moves, blocks)
- `rescheduleLesson()` helper that records a reschedule and optionally
  books the makeup in one step

## Not built yet (next sessions)

- The "tap an open slot to book a lesson" and "tap a lesson to
  reschedule" dialogs (currently just log to the console - see
  `onSlotClick` / `onLessonClick` in `App.jsx`)
- A UI for creating recurring weekly lesson templates (right now you'd
  add them directly in the Firestore console)
- Recurring blocked time (e.g. "every Thursday 6-7pm is unavailable") -
  one-off blocks work, recurring ones don't yet
- Google Sign-In screen (Firebase Auth is wired up in `firebase.js` but
  there's no login UI yet - the app currently has no access control at
  the UI layer, only at the Firestore rules layer)

## One-time setup

### 1. Create a Firebase project

1. Go to https://console.firebase.google.com and create a new project
   (any name, e.g. "piano-scheduler").
2. In the project, go to **Build > Firestore Database** and create a
   database (start in production mode - we have our own rules below).
3. Go to **Build > Authentication**, click **Get started**, and enable
   the **Google** sign-in provider.
4. Go to **Project settings** (gear icon) > **General**, scroll to
   "Your apps", click the web icon (`</>`) to register a new web app.
5. Copy the `firebaseConfig` object it gives you into
   `src/firebase.js`, replacing the `REPLACE_ME` placeholders.

### 2. Deploy the Firestore security rules

The rules in `firestore.rules` require the user to be signed in for any
read or write - that's what keeps the schedule private to you and your
wife. In the Firebase console, go to **Firestore Database > Rules**,
paste in the contents of `firestore.rules`, and publish.

### 3. Add yourself and your wife as authorized users

Since anyone with a Google account could otherwise sign in, we should
add an authorized-users check once we build the login screen - for now,
whoever signs in first can use the app. We'll tighten this before real
use, e.g. an `allowedUsers` list checked in the rules.

### 4. Push this project to GitHub

```bash
cd piano-scheduler
git init
git add .
git commit -m "Initial scaffold"
gh repo create piano-scheduler --public --source=. --push
```
(Or create the repo on github.com first, then `git remote add origin
<url>` and `git push -u origin main`.)

If your repo name isn't `piano-scheduler`, update the `base` path in
`vite.config.js` to match.

### 5. Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the app and pushes it to a `gh-pages` branch. Then in your
GitHub repo settings, under **Pages**, set the source to the `gh-pages`
branch. Your app will be live at
`https://<your-username>.github.io/piano-scheduler/`.

### 6. Try it locally first

Before deploying, it's worth running it locally to make sure the
Firebase config is correct:

```bash
npm install
npm run dev
```

## Data model

- **students**: firstName, lastInitial, parentName, phone, email,
  notes, defaultDuration
- **recurringLessons**: studentId, dayOfWeek (0=Sun...6=Sat),
  startTime ("HH:MM"), duration, active
- **scheduleExceptions**: one-off changes layered on a specific date -
  cancellations, moved times, one-off (makeup) lessons, and blocked
  time. See the comment block at the top of `src/data/lessons.js` for
  the full shape.
