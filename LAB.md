# מעבדה 5: Events ו-Triggers מתקדמים ב-GitHub Actions

## מטרה

במעבדה זו תרחיבו את ה-workflow שבניתם במעבדה 4 ותהפכו אותו ל-pipeline חכם ומדויק.
תלמדו לשלוט בדיוק *מתי* הוא יופעל, *על איזה קוד*, ו*איך לעצור אותו*.

נושאים שיכוסו:
- **Activity Types** — איזה סוג של אירוע מפעיל את ה-workflow
- **workflow_dispatch** — הפעלה ידנית עם inputs
- **Event Filters** — סינון לפי branches ו-paths
- **Skip CI** — דילוג על ריצה עם מילת מפתח ב-commit message
- **עצירת ריצות** — ביטול ריצות מקבילות ועצירה ידנית

---

## מה יש לכם

### הפרויקט

מערכת עיבוד הזמנות (Order Processing Service) — Node.js עם שני מודולים עיקריים:

```
src/
  order.js      — יצירת הזמנה, עדכון סטטוס (pending → approved/rejected/shipped), בדיקת אפשרות משלוח
  pricing.js    — חישוב מחיר סופי עם הנחות (הזמנה גדולה / לקוח פרמיום / שניהם)
  validator.js  — ולידציה של שדות ההזמנה
tests/
  order.test.js
  pricing.test.js
```

הרצה מקומית:
```bash
npm install
npm run lint   # ESLint על src/
npm test       # Jest + coverage
```

### ה-Workflow הקיים (מעבדה 4)

קובץ `.github/workflows/ci.yml` כבר קיים ב-repo עם:
- **lint** job — בודק סגנון קוד
- **test** job — מריץ בדיקות (`needs: [lint]`)
- **summary** job — מדפיס תוצאות (`needs: [lint, test]`, `if: always()`)

ה-trigger הנוכחי הוא פשוט מאוד:
```yaml
on:
  push:
  pull_request:
```

**משימתכם**: לשדרג את ה-`on:` block ולהוסיף יכולות מתקדמות.

---

## רקע תיאורטי

### 1. Activity Types

לאירועים מסוימים יש **סוגי פעילות** שאפשר לסנן לפיהם.  
לדוגמה, `pull_request` יכול להיות: `opened`, `closed`, `synchronize`, `reopened` ועוד.

ברירת המחדל (בלי `types:`) מפעילה על `opened`, `synchronize`, `reopened`.  
עם `types:` אפשר לדייק:

```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened
```

> **מתי משתמשים?** כשרוצים להפעיל workflow רק בפתיחת PR, לא בכל עדכון.

---

### 2. workflow_dispatch

מאפשר הפעלה ידנית מה-UI של GitHub (או דרך API / gh CLI).  
ניתן להגדיר `inputs` שהמשתמש ממלא לפני ההפעלה:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
      skip_tests:
        description: 'Skip test job? (true / false)'
        required: false
        default: 'false'
```

גישה ל-input בתוך step:
```yaml
run: echo "Deploying to ${{ github.event.inputs.environment }}"
```

> **הפעלה ידנית:**  
> GitHub UI → Actions → בחרו workflow → "Run workflow"

---

### 3. Event Filters — branches ו-paths

#### Branch Filter

מגביל את הטריגר ל-branches ספציפיים:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'   # glob pattern
```

#### Path Filter

מפעיל את ה-workflow **רק** אם לפחות קובץ אחד מהנתיב שצוין השתנה:

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'tests/**'
```

> **שימוש משולב:** branches + paths — שניהם חייבים להתקיים כדי שה-workflow יופעל.

**בדיקה:** שנו קובץ ב-`README.md` בלבד ← ה-workflow **לא** יופעל (path filter).  
שנו קובץ ב-`src/` על branch שאינו ברשימה ← ה-workflow **לא** יופעל (branch filter).

---

### 4. דילוג על ריצות — [skip ci]

GitHub מזהה מילות מפתח בהודעת ה-commit:

| מילת מפתח | אפקט |
|-----------|------|
| `[skip ci]` | מדלג על כל workflows |
| `[ci skip]` | זהה |
| `[no ci]` | זהה |
| `[skip actions]` | מדלג רק על GitHub Actions |

```bash
git commit -m "fix: update README typo [skip ci]"
```

> **מגבלה:** עובד רק על `push` ו-`pull_request`. לא עובד על `workflow_dispatch`.

---

### 5. עצירת ריצות — Concurrency

#### ביטול ריצות מקבילות

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- `group`: זיהוי ייחודי — כל שני workflows על אותו branch = אותה group
- `cancel-in-progress: true`: ריצה חדשה **מבטלת** ריצה ישנה על אותה group

#### עצירה ידנית

GitHub UI → Actions → לחצו על הריצה הרצויה → "Cancel workflow"

גם דרך CLI:
```bash
gh run cancel <run-id>
```

---

## הוראות המעבדה

פתחו את `.github/workflows/ci.yml` ובצעו את השינויים הבאים:

### שלב 1 — שדרגו את ה-`on:` block

החליפו את:
```yaml
on:
  push:
  pull_request:
```

ב-trigger מתקדם שכולל:
- `push` — רק ל-`main` ו-`develop`, רק כשקבצים ב-`src/**` או `tests/**` השתנו
- `pull_request` — רק כלפי `main`, עם `types: [opened, synchronize, reopened]`, אותו path filter
- `workflow_dispatch` — עם שני inputs: `environment` (required, default: `staging`) ו-`skip_tests` (default: `false`)

### שלב 2 — הוסיפו concurrency

מתחת ל-`on:` block, הוסיפו:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### שלב 3 — הוסיפו matrix ל-test job

שנו את ה-`test` job להריץ על Node.js 18 ו-20 במקביל.  
אל תשכחו `fail-fast: false`.

### שלב 4 — הוסיפו תנאי ל-test job

הוסיפו `if:` שמדלג על ה-test job אם `skip_tests` הוגדר כ-`true`:
```yaml
if: ${{ github.event.inputs.skip_tests != 'true' }}
```

### שלב 5 — הדפיסו את ה-environment ב-summary job

ב-`summary` job, הוסיפו לפקודה:
```yaml
echo "Environment: ${{ github.event.inputs.environment || 'N/A' }}"
```

### שלב 6 — בדקו את הסינונים

1. **Path filter:** עשו commit לקובץ `README.md` בלבד ← ה-workflow **לא** אמור לרוץ
2. **Skip CI:** עשו commit עם `[skip ci]` בהודעה ← ה-workflow **לא** אמור לרוץ
3. **workflow_dispatch:** הפעילו ידנית מה-UI עם `skip_tests=true` ← ה-test job **לא** אמור לרוץ
4. **ביטול:** הפעילו שתי ריצות מהירות ← הראשונה תתבטל

---

## קריטריוני הצלחה

ה-workflow שתשדרגו חייב לעמוד בכל הדרישות הבאות:

- [ ] `push` מופעל רק ל-`main` ו-`develop` (branch filter)
- [ ] `pull_request` עם `types: [opened, synchronize, reopened]` כלפי `main`
- [ ] `workflow_dispatch` עם inputs: `environment` (required) ו-`skip_tests`
- [ ] Path filter על שני האירועים — רק `src/**` ו-`tests/**`
- [ ] `concurrency` עם `cancel-in-progress: true`
- [ ] `test` job רץ על matrix Node.js 18 + 20
- [ ] `test` job מדלג כש-`skip_tests=true`
- [ ] commit עם `[skip ci]` — ה-workflow לא רץ כלל
- [ ] `summary` job מדפיס את ה-`environment`

---

## רמזים (Hints)

**Hint 1 — מבנה `on:` עם מספר אירועים:**  
כל event הוא key עצמאי תחת `on:`. לכל אחד יכולים להיות `branches:`, `types:`, `paths:` משלו. `workflow_dispatch` לא תומך ב-`paths`.

**Hint 2 — `concurrency` group:**  
`github.workflow` = שם ה-workflow, `github.ref` = branch reference (כולל `refs/heads/`). יחד מהווים מפתח ייחודי לכל branch.

**Hint 3 — matrix + needs:**  
כש-job מגדיר `strategy.matrix`, הוא מופעל פעמים (job per matrix value). הוסיפו `fail-fast: false` כדי לראות תוצאות כל הגרסאות גם אם אחת נכשלת.

**Hint 4 — `if:` על job:**  
`github.event.inputs` קיים רק בהפעלת `workflow_dispatch`. בהפעלה אחרת הוא ריק. לכן `!= 'true'` יעבוד גם כשה-input לא הוגדר כלל.

---

## משאבים

- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [pull_request activity types](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
- [workflow_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_dispatch)
- [Using concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [Skipping workflow runs](https://docs.github.com/en/actions/managing-workflow-runs/skipping-workflow-runs)
- [Canceling a workflow](https://docs.github.com/en/actions/managing-workflow-runs/canceling-a-workflow)
