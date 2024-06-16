// /entrypoints/components/SectionAndTask.tsx

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ja';
dayjs.extend(relativeTime);
dayjs.locale('ja');

const LMSURL = "https://kulms.tl.kansai-u.ac.jp";

interface SectionAndTaskProps {
  classid: string;
}
interface Task {
  ClassName: string;
  ClassId: string;
  ClassID: string;
  SectionId?: string;
  TaskName: string;
  TaskNameID?: string;
  TaskFinallineRaw: string; // 文字列型で統一 Date型はJSとTSの間で上手く受け渡せなかった
  TaskCategory?: string;
  TaskCount?: string;
  Timestamp?: string;
}
interface Section {
  ClassName: string;
  ClassId: string;
  ClassID: string;
  SectionName?: string;
  SectionId?: string;
  SectionTasks?: Task[];
  Timestamp?: string;
}

const SectionAndTask: React.FC<SectionAndTaskProps> = ({ classid }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // chrome.storage.localからセクションを読み込む
    chrome.storage.local.get([`keybyclassid${classid}`], (result) => {
      const sections = result[`keybyclassid${classid}`];
      if (sections) {
        setSections(sections);
      }
    });

    /* チェックボックス関連 はじめ */
    // chrome.storage.localからチェックされたタスクを読み込む
    chrome.storage.local.get([`checkedTasks${classid}`], (result) => {
      const savedCheckedTasks = result[`checkedTasks${classid}`];
      if (savedCheckedTasks) {
        setCheckedTasks(savedCheckedTasks);
      }
    });
  }, [classid]);

  // チェックボックスの状態を変更する関数
  const handleCheckboxChange = (taskId: string) => {
    const updatedCheckedTasks = {
      ...checkedTasks,
      [taskId]: !checkedTasks[taskId],
    };
    setCheckedTasks(updatedCheckedTasks);

    // chrome.storage.localに更新されたチェックされたタスクを保存する
    chrome.storage.local.set({ [`checkedTasks${classid}`]: updatedCheckedTasks });
  };

  /* チェックボックス関連 おわり */

  // タスクの期限レベルを選択する関数
  const selectTaskDeadlineLevel = (item: Date, TaskNeoID: string) => {
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

  // Date型を任意のフォーマットにする関数
  const formatDateObj = (dateObj: Date): { FormalFormatedDate: string, ShortFormatedDate: string, GFormatedDate: string } => {
    const padZero = (num: number) => num.toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const month = padZero(dateObj.getMonth() + 1);
    const day = padZero(dateObj.getDate());
    const hours = padZero(dateObj.getHours());
    const minutes = padZero(dateObj.getMinutes());
    const seconds = padZero(dateObj.getSeconds());
    const FormalFormatedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    const ShortFormatedDate = `${month}/${day} ${hours}`;
    const GFormatedDate = `${year}${month}${day}`;
    return { FormalFormatedDate, ShortFormatedDate, GFormatedDate };
  };

  // タスクを描画する関数
  const renderTask = (task: Task) => {

    let TaskNeoID = `${task.TaskNameID}@${task.TaskName}`;

    if (task.TaskFinallineRaw) {
      const TaskFinallineRaw = new Date(task.TaskFinallineRaw);
      var TaskDeadlineLevel = selectTaskDeadlineLevel(TaskFinallineRaw, TaskNeoID);
      var { FormalFormatedDate, ShortFormatedDate, GFormatedDate } = formatDateObj(TaskFinallineRaw);
    } else {
      var TaskDeadlineLevel = "lvMin"
      var FormalFormatedDate = "期限なし";
      var ShortFormatedDate = "期限なし";
      var GFormatedDate = "";
    }

    return (
      <li data-position="Task" key={task.TaskName} className='list-item text-sm my-2'>
        <input
          type="checkbox" 
          className="align-middle shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" 
          id={`${task.ClassId}@${task.TaskName}`} 
          onChange={() => handleCheckboxChange(`${task.ClassId}@${task.TaskName}`)}
          checked={checkedTasks[`${task.ClassId}@${task.TaskName}`] || false} 
          />
        <time data-level={TaskDeadlineLevel} dateTime={FormalFormatedDate} className='align-middle'>
          <i data-icon={TaskDeadlineLevel}></i><span>{ShortFormatedDate}</span>
        </time>
        <a data-position="TaskName" href={task.TaskNameID ? `${LMSURL}/webclass/login.php?id=${task.TaskNameID}&page=1` : ""} target="_blank" rel="noopener noreferrer" className='align-middle font-bold flex-1 whitespace-nowrap'>{task.TaskName}</a>
        <span data-position="TaskCategory" className="tag"><span className="tag_hash">#</span><a className="tag_link">{task.TaskCategory}</a></span>
        <span data-position="TaskCount">（{task.TaskCount}回）</span>
 
        <a target="_blank" href={`http://www.google.com/calendar/event?action=TEMPLATE&text=${task.ClassName}｜${task.TaskName}${GFormatedDate ? `&dates=${GFormatedDate}/${GFormatedDate}`: ""}&details=（コース）${LMSURL}/webclass/login.php?group_id=${task.ClassID}${task.TaskNameID ? `（タスク）${LMSURL}/webclass/login.php?id=${task.TaskNameID}&page=1` : ""}`}>
          <i data-icon="calendar-plus"></i>
        </a>

      </li>
    );
  };

  // 本番環境 セクションとタスクを描画
  return (
    <ul className="pl-5">
      {sections[0]?.Timestamp && (
      <span data-position="Timestamp" className='text-xs'><i data-icon="refresh-cw"></i><span>{dayjs(new Date(sections[0]?.Timestamp)).fromNow() + ""}</span></span>
      )}
      {sections.map((section) => (
        <li data-position="SectionWrapper" key={section.SectionId} className='list-item mb-4'>
          <span data-position="SectionName" className='text-xs text-gray-400'>{section.SectionName}</span>
          <ul data-position="SectionTasks" data-sectionid={section.SectionId}>
            {section.SectionTasks?.map(renderTask)}
          </ul>
        </li>
      ))}
    </ul>
  );

};

export default SectionAndTask;