# 自行部署

版本：science-2026-09-16.2

## 部署包

解壓 `personlearning-deploy-20260916.zip`，把裡面的全部檔案上傳至靜態網站的發布目錄。`index.html` 必須位在該目錄根層；`css/`、`js/` 與 `docs/` 保持原有相對位置。可部署在網站根目錄或子目錄。

- 不需安裝套件，不需建置指令，不需要後端或 API 金鑰。
- React 18.2.0 已附於 `js/vendor/`，包含授權；沒有外部字型或執行階段 CDN 請求。
- 透過 HTTP/HTTPS 開啟，不以雙擊 `index.html` 的 file 網址作正式部署。
- 所有更新檔案應一起發布，避免新介面搭配舊題庫。更新後重新整理並確認頁尾版本。
- 尚未提供 Service Worker：附帶本機資源不等於已安裝可離線開啟的 PWA。

## 本機檢查

在解壓目錄執行 `python3 -m http.server 8080`，瀏覽 http://localhost:8080。

依序確認：自然頁可開啟、單元可練習、作答後重新整理可續答、完成後 XP 只增加一次、英文開關正常、備份可以下載。

## 進度與搬移

進度保存在各瀏覽器的 localStorage，沒有帳號或雲端同步。更换網域、瀏覽器或連接埠前，先從印章／進度頁匯出備份，在新網址匯入。更新同一網址的網站檔案不會主動清除進度。

新題目版本不沿用舊版成績；舊資料保留為歷史。若看到未保存或分頁衝突提示，先匯出本頁資料再重新載入。不要把各分頁當成同時作答的協作工具；目前以拒絕舊資料覆寫保護紀錄，沒有多人交易式同步。

## 原始碼包

`personlearning-source-20260916.zip` 另含 JSON 題庫、建置腳本、22 項測試與 CI。編輯題庫後執行：

```sh
node scripts/build-science.cjs
node --test tests/science.test.cjs
node scripts/build-science.cjs --check
python3 scripts/package-release.py /absolute/path/to/output
```

## 交付範圍

24 單元、247 題、71 題曾修訂內容、988 個雙語選項，新增學習目標與先備主題、3 道讀表呈現、作答理由、不確定標記、延後複習、報告與回合封存。

這個版本可部署，但不把「可部署」等同原盤點的所有內容改善都已完成。全庫干擾選項改寫、逐句英文與引用查核、正式課程映射、完整探究題型及跨瀏覽器／螢幕閱讀器驗證尚未全部完成。詳細狀態見 `docs/RELEASE_STATUS.md`。
