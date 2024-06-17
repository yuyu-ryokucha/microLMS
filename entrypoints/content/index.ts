// /entrypoints/content.ts

import './style.css';

export default defineContentScript({
  matches: ['*://kulms.tl.kansai-u.ac.jp/*'],

  async main() {
    ///
    const dayjs = (await import('dayjs')).default;
    const relativeTime = (await import('dayjs/plugin/relativeTime')).default;
    await import('dayjs/locale/ja');

    // dayjsのセットアップ
    dayjs.extend(relativeTime);
    dayjs.locale('ja');

    // 非本番環境

    var LMSURL = "https://kulms.tl.kansai-u.ac.jp";

    /* テーブル 全角の講義名を半角に統一・日本語の曜日表記を英語に統一 */
    var zenkakutable = {
      '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9', '０': '0',
      'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j',
      'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't',
      'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
      'Ａ': 'A', 'Ｂ': 'B', 'Ｃ': 'C', 'Ｄ': 'D', 'Ｅ': 'E', 'Ｆ': 'F', 'Ｇ': 'G', 'Ｈ': 'H', 'Ｉ': 'I', 'Ｊ': 'J',
      'Ｋ': 'K', 'Ｌ': 'L', 'Ｍ': 'M', 'Ｎ': 'N', 'Ｏ': 'O', 'Ｐ': 'P', 'Ｑ': 'Q', 'Ｒ': 'R', 'Ｓ': 'S', 'Ｔ': 'T',
      'Ｕ': 'U', 'Ｖ': 'V', 'Ｗ': 'W', 'Ｘ': 'X', 'Ｙ': 'Y', 'Ｚ': 'Z', '　': ' '
    };
    var dayofweektable = {
      '月曜日': 'Mon', '火曜日': 'Tue', '水曜日': 'Wed', '木曜日': 'Thu', '金曜日': 'Fri', '土曜日': 'Sat', '日曜日': 'Sun', 'その他': 'Other', '他': 'Other', 'オンライン': 'Other', 'オンデマンド': 'Other',
      '月曜': 'Mon', '火曜': 'Tue', '水曜': 'Wed', '木曜': 'Thu', '金曜': 'Fri', '土曜': 'Sat', '日曜': 'Sun', /* '日': 'Sun'　←これ大丈夫？ */
    };

    /* 関数 テーブルで文字列を置き換える */
    function translate(str, table) {
      return str.split('').map(char => table[char] || char).join('');
    }
    function translate2(str, table) {
      return table[str] || str; // なぜか必要
    }

    function selectTaskDeadlineLevel(item: Date) {
      const hoursDiff = Math.floor((item.getTime() - Date.now()) / (1000 * 60 * 60));
      if (hoursDiff < -48) {
        return "lvMax"; // 期限後（48時間以上）
      } else if (hoursDiff < 0) {
        return "lv10"; // 期限後（0〜48時間）
      } else if (hoursDiff < 24) {
        return "lv5"; // 期限前（24時間未満）
      } else if (hoursDiff < 48) {
        return "lv4"; // 期限前（24〜48時間）
      } else if (hoursDiff < 120) {
        return "lv3"; // 期限前（48時間〜5日）
      } else if (hoursDiff < 336) {
        return "lv2"; // 期限前（5日〜2週間）
      } else {
        return "lv1"; // 期限前（2週間以上）
      }
    };


    /* 関数 インデックスページにおいて時間割表のを取得･保存する */
    function getTimetable() {

      var ArrayClass: any[] = [];

      let defaultPeriodCounter = 1; // オンデマンド授業用 初期化は0からではなく1からで

      let ClassElems = document.querySelectorAll("#schedule-table a, #courses_list_left a");
      ClassElems.forEach(item => {
        let RawClassName = (item as HTMLElement).innerText; // TS仕様 旧コードは let RawClassName = item.innerText;
        let RawClassURL = item.getAttribute("href");

        let ClassName = RawClassName.slice(0, RawClassName.indexOf("(20")).replace("» ", "").replace(/(?=\[\s).*$/, "").replace(/(?=\s\().*$/, "").trim();
        let ClassNameHankaku = translate(ClassName, zenkakutable);
        let ClassID = RawClassURL.substring(RawClassURL.indexOf("course.php/") + 11, RawClassURL.indexOf("/login"));
        let ClassSemester = (RawClassName.match(/[春夏秋冬]学期/) || ["通年"])[0];    // リンクテキスト依存 本来はしかるべき要素から拾うべき
        let ClassDayOfWeek = (RawClassName.match(/[月火水木金土日]曜日/) || ["他"])[0]; // リンクテキスト依存 本来はthタグから解析すべき
        let ClassDayOfWeekEN = translate2(ClassDayOfWeek, dayofweektable);

        let ClassPeriodMatch = RawClassName.match(/[12345678]限/); // リンクテキスト依存 本来はtdタグから解析すべき
        let ClassPeriod = ClassPeriodMatch ? ClassPeriodMatch[0] : defaultPeriodCounter.toString() + "限";
        if (!ClassPeriodMatch) { defaultPeriodCounter++; } // オンデマンド授業用
        let ClassPeriodNum = ClassPeriod.replace(/[^0-9]/g, '');

        let Class = {
          "ClassName": ClassNameHankaku,
          "ClassNameRaw": RawClassName, // 互換のため
          "ClassID": ClassID,
          "ClassId": ClassID, // 下方互換のため
          "ClassSemester": ClassSemester,
          "ClassDayOfWeek": ClassDayOfWeek,
          "ClassDayOfWeekEN": ClassDayOfWeekEN,
          "ClassPeriod": ClassPeriodNum,
          "Timestamp": String(new Date()),
        };
        ArrayClass.push(Class);
      });

      chrome.storage.local.set({ keyclass: ArrayClass }, function () {
      });
      /*
      console.log("ArrayClass"); // デバッグ用
      console.log(ArrayClass); // デバッグ用
      console.log(JSON.stringify(ArrayClass[0])); // デバッグ用
      */

    }

    /* 関数 コースページにおいてセクションと所属するタスクを取得･保存する */
    function searchAllTasks() {

      let RawClassURL = document.URL;
      let RawClassName = document.title; // タイトルタグをベースに

      let SectionClassID = RawClassURL.substring(RawClassURL.indexOf("course.php/") + 11, RawClassURL.indexOf("/?"));
      let SectionClassName = RawClassName.slice(0, RawClassName.indexOf("(20")).replace("» ", "").replace(/(?=\[\s).*$/, "").replace(/(?=\s\().*$/, "").trim();
      let SectionClassNameHankaku = translate(SectionClassName, zenkakutable);
      let SectionClassSemester = (RawClassName.match(/[春夏秋冬]学期/) || ["通年"])[0];    // リンクテキスト依存 本来はSectionClassIDでArrayClassに問い合わせるべき
      let SectionClassDayOfWeek = (RawClassName.match(/[月火水木金土日]曜日/) || ["他"])[0]; // リンクテキスト依存
      let SectionClassDayOfWeekEN = translate2(SectionClassDayOfWeek, dayofweektable);
      let SectionClassPeriod = ((RawClassName.match(/[12345678]限/) || ["0"])[0]); // リンクテキスト依存
      let SectionClassPeriodNum = SectionClassPeriod.replace(/[^0-9]/g, ''); // リンクテキスト依存
      let SectionElems = document.querySelectorAll('.cl-contentsList_folder');

      let nonameCounter = 1; // 無題セクション用 初期化は0からではなく1からで

      var ArraySection: any[] = []; // ほぼ固定位置
      var ArrayTask: any[] = []; // ほぼ固定位置 これは結局ArraySectionに入れるだけ

      SectionElems.forEach((item) => {
        var SectionName = item.querySelector('.panel-title').textContent.trim();
        var SectionID = item.getAttribute("id");
        var Tasks = item.querySelectorAll('.list-group > .cl-contentsList_listGroupItem');

        // 無題セクション用 たまにセクションの名前を指定しない派の先生がいるのでその対策（応急処置）
        if (!SectionName) {
          SectionName = `無題${nonameCounter}`;
          SectionID = `noname${nonameCounter}`;
          nonameCounter++;
        }

        var Section = {
          "ClassName": SectionClassNameHankaku,
          "ClassNameRaw": RawClassName,
          "ClassID": SectionClassID,
          "ClassId": SectionClassID, // 下方互換のため
          "SectionName": SectionName,
          "SectionID": SectionID,
          "SectionId": SectionID,  // 下方互換のため
          "SectionTasks": [], // 配列（タスク）
          "Timestamp": String(new Date()),
        };
        ArraySection.push(Section);

        Tasks.forEach((item) => {
          let TaskName = item.querySelector(".cm-contentsList_contentName > :not(.cl-contentsList_new)").textContent;
          let TaskNameLinkElement = item.querySelector(".cm-contentsList_contentName > a");
          let TaskNameLinkMatch = TaskNameLinkElement ? TaskNameLinkElement.getAttribute("href") : "";
          let TaskNameID = TaskNameLinkMatch ? new URLSearchParams(TaskNameLinkMatch.split('?')[1]).get('set_contents_id') : "";
          let TaskCategory = (item.querySelector("div.cl-contentsList_categoryLabel") || { textContent: "分類なし" }).textContent;
          let TaskCount = (item.querySelector("div.cl-contentsList_contentDetailListItemData > a[href*='history']") || { textContent: "利用回数 0" }).textContent;
          let TaskCountNum = TaskCount.replace(/[^0-9]/g, '');

          let TaskDateElem = item.querySelector('div.cm-contentsList_contentDetailListItemLabel + div.cm-contentsList_contentDetailListItemData');
          /*
          console.log(TaskDateElem);
          */
          let TaskDateRaw = TaskDateElem ? TaskDateElem.textContent.trim() : "nodeadline";
          let dates = TaskDateRaw.match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2})/g);

          // 日時取得の機構 闇が深いので仕様変更で壊れるとしたらココかも
          let TaskDeadline, TaskStartline, TaskStartlineRaw, TaskDeadlineRaw;
          if (dates && dates.length === 2) {
            TaskStartlineRaw = dates[0];
            TaskStartline = new Date(dates[0]);
            TaskDeadlineRaw = dates[1];
            TaskDeadline = new Date(dates[1]);
          } else {
            TaskStartline = null;
            TaskDeadline = null;
          }

          // 再提出に対応（応急処置）
          let TaskReDateRaw0 = item.querySelectorAll('div:has(strong.text-danger) > div.cm-contentsList_contentDetailListItemData');
          let TaskReDateRaw = TaskReDateRaw0.length > 0 ? TaskReDateRaw0[0].textContent.trim().match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2})/g) : null;
          let TaskReDeadline, TaskReDeadlineRaw, TaskFinalline, TaskFinallineRaw, IsFinallineReDeadline;
          if (TaskReDateRaw) {
            TaskReDeadlineRaw = dates[0];
            TaskReDeadline = new Date(TaskReDateRaw[0]);
            TaskFinallineRaw = TaskReDeadlineRaw;
            TaskFinalline = TaskReDeadline;
            IsFinallineReDeadline = true;
          } else {
            TaskReDeadline = null;
            TaskFinallineRaw = TaskDeadlineRaw;
            TaskFinalline = TaskDeadline;
            IsFinallineReDeadline = false;
          }

          // オプション 本家でマークアップ
          if (TaskDeadline) {
            let deadlineClass = selectTaskDeadlineLevel(new Date(TaskDeadline));
            let TaskDateElemNew = document.createElement('span');
            TaskDateElemNew.setAttribute("style", "display: none;");
            TaskDateElemNew.innerHTML = `<span data-position="deadlineElembymicroLMS" data-deadline="${deadlineClass}">${dayjs(new Date(TaskDeadline)).fromNow() + ""}</span>`;
            TaskDateElem.after(TaskDateElemNew);
          }

          var Task = {
            "ClassName": SectionClassNameHankaku,
            "ClassNameRaw": RawClassName,
            "ClassID": SectionClassID,
            "ClassId": SectionClassID, //下方互換のため

            "SectionName": SectionName,
            "SectionID": SectionID,
            "SectionId": SectionID, // 下方互換のため

            "TaskName": TaskName,
            "TaskNameID": TaskNameID,
            "TaskCategory": TaskCategory,
            "TaskCount": TaskCountNum,

            "TaskDeadlineRaw": TaskDeadlineRaw,
            "TaskDeadline": TaskDeadline,
            "TaskReDeadlineRaw": TaskReDeadlineRaw,
            "TaskReDeadline": TaskReDeadline,
            "TaskFinallineRaw": TaskFinallineRaw, // 利用を推奨
            "TaskFinalline": TaskFinalline, // 利用を推奨
            "TaskStartlineRaw": TaskStartlineRaw,
            "TaskStartline": TaskStartline,
            "IsFinallineReDeadline": IsFinallineReDeadline,

            "Timestamp": String(new Date()),
          };
          ArrayTask.push(Task);
        });

      });
      ArraySection.forEach(section => { section.SectionTasks = ArrayTask.filter(task => task.SectionId === section.SectionId); }); // ArraySection内のSectionTasksにArrayTaskを統合

      chrome.storage.local.set({ ["keybyclassid" + SectionClassID]: ArraySection }, function () {   // 情報社会論ならkeybyclassid24170372というkeynamebyclassidでその配列(Section群)を取り出せるようにする
      });
      /*
      console.log("ArraySection"); // デバッグ用
      console.log(ArraySection); // デバッグ用
      console.log(JSON.stringify(ArraySection[0])); // デバッグ用
      */
    }

    // 本番環境

    // オプション 時間割表の取得 storage権限が必須
    if (!document.URL.includes("course")) {
      chrome.storage.local.get('setting_timetablestandby', function (result) {
        if (result.setting_timetablestandby === true) { // オプションの値の確認
          return 0;
        } else {
          let timetableElem = document.getElementById("schedule-table");
          if (timetableElem) { // 誤爆を防ぐ
            getTimetable();
          }
        }
      });
    }

    // 課題タスクの取得（重要）
    if (document.URL.includes("course") && !document.URL.includes("login")) { // 誤爆を防ぐ（未完全）
      searchAllTasks();
    }

    // オプション カスタムフォント  
    if (document.URL.includes("http")) {
      chrome.storage.local.get('setting_customfont', function (result) {
        if (result.setting_customfont === true) { // オプションの値の確認
          document.body.classList.add("setting_customfont");

          let fontUrl = chrome.runtime.getURL('/font/IBMPlexSansJP-Regular.woff2');
          let fontUrlBold = chrome.runtime.getURL('/font/IBMPlexSansJP-Bold.woff2');
          let style = document.createElement('style');
          style.textContent =
        `
        @font-face {
            font-family: "iIBMPlexSansJP";
            src: url('${fontUrl}') format("woff2");
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
          font-family: "iIBMPlexSansJP";
          src: url('${fontUrlBold}') format("woff2");
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: "iIBMPlexSansJP";
          src: url('${fontUrlBold}') format("woff2");
          font-weight: 600;
          font-style: normal;
        }
        @font-face {
          font-family: "iIBMPlexSansJP";
          src: url('${fontUrlBold}') format("woff2");
          font-weight: 700;
          font-style: normal;
        }
        body {
            font-family: 'iIBMPlexSansJP', sans-serif;
        }
        `;
          document.head.appendChild(style);
        
        }
      });
    }

    // オプション 本家の改善
    if (document.URL.includes("http")) {
      chrome.storage.local.get('setting_renewal_disabled', function (result) {
        if (result.setting_renewal_disabled === true) {
          document.body.classList.add("setting_renewal_disabled");
        }
      });
    }

    // オプション PDF
    if (document.URL.includes("http")) {
      chrome.storage.local.get('setting_pdfexpansion', function (result) {
        if (result.setting_pdfexpansion === true) {
          document.body.classList.add("setting_pdfexpansion");
        }
      });
    }

    // main関数

    ///
  },
});