# Logic Lab 邏輯任務基地

為 2e(雙重特殊)自學者設計的雙語學習網站:漢字千字文字族、數學出題引擎、自然科學偵探,附神獸圖鑑與小遊戲動機系統。

A bilingual self-learning hub for a twice-exceptional homeschooler: Hanzi logic families (Qianziwen), a generative math engine, science-detective quizzes, plus a beast-codex motivation system.

## 部署到 GitHub Pages / Deploy to GitHub Pages

1. 在 GitHub 建立新 repository(例如 `logic-lab`)
2. 上傳本資料夾全部檔案(`index.html` 必須在根目錄)
3. Repo → **Settings → Pages** → Source 選 **Deploy from a branch** → Branch 選 `main`、資料夾選 `/ (root)` → Save
4. 一兩分鐘後網站會出現在 `https://<你的帳號>.github.io/logic-lab/`

## 本機預覽 / Local preview

因為 `app.js` 由 Babel 以 XHR 載入,**直接雙擊 index.html 無法運作**,請啟動本機伺服器:

```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```

## 專案結構 / Structure

```
index.html          入口(GitHub Pages 需要)
css/style.css       設計系統(硃砂/鈷藍/苔綠 + 楷體)
js/data.js          內容資料層:漢字字族(L1 193 字、L2 千字文 178 字)、自然概念、神獸圖鑑
js/app.js           引擎與介面:數學出題引擎、四題型測驗、衝刺、遊樂園、進度(React + Babel)
```

## 擴充內容 / Adding content

- **漢字**:在 `js/data.js` 的 `HANZI` 中依既有格式新增字族(L3–L6 原始字表已備份於註解)
- **自然**:在 `SCI` 中新增概念單元與推理題
- **數學**:在 `js/app.js` 的 `MATH_GEN` 中新增生成器函式

進度儲存於瀏覽器 localStorage(鍵名 `logic-lab-v1`),換裝置不互通。
