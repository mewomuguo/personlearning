# 台灣小學常用一千字：來源與編輯說明

更新：2026-09-14。字庫 ID：`tw-primary-1000-v1`。

## 選字依據

原始來源是教育部《國小學童常用字詞調查報告書》（民國九十一年三月二版）的[字頻總表](https://language.moe.gov.tw/001/Upload/files/SITE_CONTENT/M0001/PRIMARY/shrest2-1.htm)，[完整 DBF 下載](https://language.moe.gov.tw/001/Upload/files/SITE_CONTENT/M0001/PRIMARY/download/shrest1.zip)。表內依出現頻次排序，共 5,021 字。它是歷史調查資料，不宣稱反映最新年度教科書分布。

本專案依原序取字，將「裏」統一為「裡」、「台」統一為「臺」後去重，取前 1,000 字；因此選取範圍延伸至原表第 1,002 號「堆」。此為本專案採用的正體寫法整理，不宣稱「台」在所有語境中都不能使用。`rank` 保留原表頻序，未以程式生成的等級冒充原表年級。

這是依國小語料字頻選出的練習字表，**不是教育部指定的一千字清單**，也不是千字文。原表高頻的姓名用字如「劉」仍保留，並用姓氏的正確語境教學；不以罕用古字湊足數量。

六批字數依序為 200、200、150、150、150、150，每包最多 20 字。等級是練習批次，不代表小一至小六。例詞可包含尚未列入這一千字的字，目標認讀字以字卡大字為準。

## 注音與詞義

主要核對來源：教育部[《國語辭典簡編本》公眾授權資料](https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/dict_concised_download.html)，使用 `dict_concised_2014_20260626.xlsx`（下載 ZIP 中的檔名）。少數未收錄的常見組合詞由本專案編寫；先前例詞候選亦參考國小詞頻表及教育部《重編國語辭典修訂本》的 [g0v JSON 轉換](https://github.com/g0v/moedict-data)。

- `definitionSource: moe-concised-20260626`：`zh` 是簡編本完整義項開頭的原文摘錄，未改寫字句；`wordId` 保留原字詞號。
- `definitionSource: authored`：本專案的獨立教學說明，不標示為教育部原文；不把古典釋義直接當作現代生活用法。
- `wzy` 是例詞整體讀音，`zy` 僅代表 `targetIndex` 位置的字在該例詞中的讀音。多音字可另有讀法，並不以一筆字卡宣稱唯一讀音。
- `readings` 和 `wordReadings` 保存簡編本收錄讀音及本卡選定讀音，用來排除可能同音的選字干擾項。
- 注音採詞典標音；一、不等字在實際連讀時可能變調。詞典標音與口語連讀不應混為錯字。
- 部首是字典查檢分類，不以部首直接推定完整字義。

教育部辭典資料著作權屬中華民國教育部，依[創用 CC 姓名標示—禁止改作 3.0 台灣](https://creativecommons.org/licenses/by-nd/3.0/tw/)公眾授權。原始[《國語辭典簡編本》公眾授權使用說明](MOE_CONCISED_LICENSE.pdf)隨本專案保留。編輯單位與完整來源見[教育部公眾授權網](https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html)。獨立編寫的教學文案與程式不聲稱是教育部發布內容。

## 英文輔助

英文供理解生活例詞，不拿來代表漢字所有義項，也不用英文翻譯直接判斷單字對錯。初稿參考 [g0v moedict-data 的多語資料](https://github.com/g0v/moedict-data/blob/master/dict-revised-translated.json.xz)中來自 [CC-CEDICT](https://cc-cedict.org/wiki/)的英文詞義，並針對兒童例詞修訂。英文詞義沿用 CC-CEDICT 的 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)授權並標示已修改；來源資料與本專案簡短英文輔助不代表教育部翻譯。已排除把「成功、白雲、朝陽、吉利」誤作地名或品牌的翻譯。

## 可重現性與驗證

編輯 `data/hanzi-1000.json` 後執行 `node scripts/build-hanzi.cjs`。生成器只重建 `js/data.js` 的漢字區，不改自然或神獸資料。

本次下載檔 SHA-256：

- `shrest1.zip`：`54859747504dacd60a51f1e4b8a6aaf5bc6c7f256545327a9367d413f4bfe1e7`
- `dict_concised_2014_20260626.zip`：`fc83d27eb3fbf6fcfdb791e7d05ef60946b58ef8e8857ed165b612217b392806`

`tests/hanzi.test.cjs` 檢查字數、跨級去重、注音對應、四選項、同音排除、指定包出題及舊進度與新字表的交集。沒有刪除使用者舊存檔；仍在新字表中的既有答對紀錄可繼續點亮，已移除的字不列入新字表點亮數。
