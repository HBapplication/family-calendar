# היומן המשפחתי — הפעלה עם Firebase + GitHub

הפרויקט עבר משדרוג: מ"פרוטוטייפ" בתוך הצ'אט, לאפליקציית React אמיתית
(Vite) שמתחברת ל-**Firestore** (בסיס נתונים + סנכרון בזמן אמת) ול-
**Firebase Authentication** (כניסה עם Google אמיתית ומאובטחת). זה גם
פותר את שתי המגבלות הקודמות: יש עכשיו הרשאות אמיתיות שנאכפות בשרת (לא
רק בממשק), ואפשר להתקין את זה כ-PWA אמיתי לאחר הפריסה.

## מבנה הפרויקט
```
src/App.jsx        — כל ממשק המשתמש (לוח שנה, טפסים, ניהול בני משפחה וכו')
src/firebase.js     — התחברות ל-Firebase + כל הפונקציות שקוראות/כותבות ל-Firestore
src/main.jsx        — נקודת הכניסה של Vite/React
firestore.rules     — כללי האבטחה (מי מותר לו לקרוא/לכתוב מה)
firebase.json / .firebaserc — הגדרות Firebase Hosting
.github/workflows/deploy.yml — פריסה אוטומטית מ-GitHub בכל push ל-main
public/             — manifest.json, service-worker.js, אייקוני ה-PWA
```

## שלב 1 — יצירת פרויקט Firebase
1. גשו ל-[Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Authentication** → **Sign-in method** → הפעילו **Google** כ-provider.
3. **Firestore Database** → **Create database** → מצב **Production**.
4. **Project settings** (גלגל השיניים) → **General** → תחת "Your apps"
   לחצו על סמל ה-Web (`</>`) כדי ליצור אפליקציית ווב, ותעתיקו את אובייקט
   ה-config שמוצג.
5. הדביקו את הערכים בתוך `src/firebase.js`, בתחילת הקובץ:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
   };
   ```
6. עדכנו גם את `.firebaserc` ואת `projectId` בקובץ
   `.github/workflows/deploy.yml` עם ה-Project ID האמיתי שלכם.

## שלב 2 — פריסת כללי האבטחה (Firestore Rules)
כללי האבטחה כבר מוכנים בקובץ `firestore.rules` (הם אלה שאוכפים בפועל
את 3 רמות ההרשאה — לא רק הממשק). כדי לפרוס אותם:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```
או פשוט הדביקו את תוכן הקובץ ידנית ב-Firebase Console →
Firestore Database → Rules → Publish.

## שלב 3 — הגדרת עצמכם כ"מנהל מערכת"
1. היכנסו לאפליקציה (מקומית עם `npm run dev`, או אחרי פריסה) ולחצו
   "המשך עם Google".
2. ב-Firebase Console → **Authentication** → **Users**, מצאו את עצמכם
   והעתיקו את ה-**User UID**.
3. ב-**Firestore Database**, צרו collection בשם `admins`, ובתוכו
   document שה-**ID** שלו הוא ה-UID שהעתקתם (אין צורך למלא שדות בפנים —
   מספיק שהמסמך קיים). זהו — עכשיו כפתור "כניסה כמנהל מערכת" יופיע לכם
   באפליקציה אחרי הכניסה עם Google.

זו הגנה אמיתית: אף לקוח (דפדפן) לא יכול לכתוב ל-collection הזו בעצמו —
זה מוגדר מפורשות ב-`firestore.rules` (`allow write: if false;`).

## שלב 4 — הרצה מקומית
```bash
npm install
npm run dev
```

## שלב 5 — פריסה דרך GitHub
1. צרו repository ב-GitHub והעלו אליו את כל הפרויקט.
2. צרו Service Account לפריסה:
   ```bash
   firebase init hosting:github
   ```
   הפקודה הזו יוצרת אוטומטית secret בשם `FIREBASE_SERVICE_ACCOUNT_...`
   ב-GitHub repo שלכם ומגדירה workflow. **לחלופין**, אם אתם משתמשים
   בקובץ ה-workflow המצורף (`deploy.yml`), צרו service account ידנית
   ב-Google Cloud Console (IAM → Service Accounts → מפתח JSON), והוסיפו
   אותו כ-secret בשם `FIREBASE_SERVICE_ACCOUNT` תחת
   Settings → Secrets and variables → Actions ב-repo.
3. בכל `git push` לענף `main`, ה-workflow יבנה (`npm run build`) ויפרוס
   אוטומטית ל-Firebase Hosting.
4. לאחר הפריסה הראשונה תקבלו כתובת בסגנון
   `https://your-project-id.web.app` — זו כתובת HTTPS אמיתית, ולכן:
   - **PWA אמיתי**: הדפדפן יציע "התקנה למסך הבית" אוטומטית (בזכות
     `manifest.json` ו-`service-worker.js` שכבר ב-`public/`).
   - **Google Sign-In אמיתי**: זכרו להוסיף את הכתובת הזו תחת
     Firebase Console → Authentication → Settings →
     **Authorized domains** (בדרך כלל נוסף אוטומטית לדומיין של
     `web.app`/`firebaseapp.com`).

## מודל הנתונים ב-Firestore
```
families/{familyId}                       — {name, createdAt}
families/{familyId}/members/{uid}         — {name, email, role: 'parent'|'child'}
families/{familyId}/tasks/{taskId}        — פרטי כל משימה
users/{uid}                               — {families: [familyId, ...]}
admins/{uid}                              — קיום המסמך = הרשאת מנהל מערכת
```
ה-ID של כל מסמך `member` הוא ה-**Firebase Auth UID** של אותו אדם — זה
מה שמאפשר לכללי האבטחה לוודא בצד השרת ש"רק אני יכול ליצור/לתבוע את
המסמך של עצמי", ושרק הורה (`role == 'parent'`) יכול לערוך משימות
ולנהל בני משפחה אחרים.

## הרשאות (נאכפות עכשיו גם ב-Firestore Rules, לא רק בממשק)
- **מנהל מערכת** — מסמך תחת `admins/{uid}` (מנוהל ידנית, ראו שלב 3).
  רואה את כל המשפחות, יכול לפתוח כל אחת ולנהל אותה, ולמחוק משפחות.
- **הורה** (`role: 'parent'`) — יוצר/עורך/מוחק משימות, מנהל בני משפחה
  (שינוי הרשאה, הסרה), משתף את קוד המשפחה.
- **ילד/ה** (`role: 'child'`) — צפייה בלבד. הצטרפות לקוד משפחה קיים
  מוסיפה כברירת מחדל כ"ילד/ה"; רק הורה יכול לשדרג.

## שיתוף עם Google Calendar
כפי שהיה קודם — לכל משימה יש כפתור "הוספה ליומן Google", ויש גם ייצוא
מלא של כל היומן כקובץ ICS (לייבוא ב-Google Calendar → הגדרות → ייבוא
וייצוא). זה לא קשור ל-Firebase ונשאר בדיוק כפי שהיה.

בהצלחה! 🏠
