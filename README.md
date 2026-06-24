# מערכת הזמנות בר 🍹

אפליקציית ניהול הזמנות פנימית לבר/לאונג׳ — בעברית מלאה, RTL, מותאמת מסך מגע.

## הרצה מקומית

```bash
npm install
npm run dev
```

## פריסה ל-GitHub Pages

### שלב 1 — הגדרת מספר וואטסאפ
פתח את `src/data.js` ושנה:
```js
export const WHATSAPP_NUMBER = '972501234567'  // המספר שלך
```

### שלב 2 — העלאה ל-GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### שלב 3 — הפעלת GitHub Pages
1. כנס ל-Settings של ה-repo
2. לחץ על **Pages** בתפריט הצד
3. תחת **Source** בחר **GitHub Actions**
4. המתן דקה — האתר יהיה זמין בכתובת:
   `https://USERNAME.github.io/REPO`

### שלב 4 (אופציונלי) — שינוי base path
אם שם ה-repo שלך הוא למשל `bar-app`, ודא ש-`vite.config.js` מכיל:
```js
base: './'
```
(כבר מוגדר כך)

## תכונות
- 30 שולחנות (ניתן לשנות בהגדרות)
- קטגוריות ומוצרים הניתנים לעריכה מלאה
- הוספה/מחיקה/שינוי שם של קטגוריות ומוצרים
- שליחת הזמנה לוואטסאפ
- עיצוב כהה, RTL, מותאם מסך מגע
