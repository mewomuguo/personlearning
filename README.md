# Logic Lab 邏輯任務基地



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
