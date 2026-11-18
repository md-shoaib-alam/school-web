# src/temp — deliberately temporary code

Everything in this folder is a testing aid, not a product feature. Each piece returns `null`
unless `process.env.NODE_ENV === "development"`, so a production build cannot render it.

- `absence-push-preview-modal.tsx` — the "Test Absence Push" button and its phone/desktop
  preview dialog, fired from `src/components/screens/parent/attendance.tsx`. It calls
  `POST /attendance/test-absence-push`, which sends to the signed-in user's own registered
  devices only and writes no attendance record.

**Remove all of it:** delete this folder and every `@/temp/...` import.
**Keep something for good:** move it into `src/components/screens/...` and drop the
`NODE_ENV` guard.

The server route stays either way — the Expo app's dev build uses it too.
