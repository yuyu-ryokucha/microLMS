// /entrypoints/components/Digest.tsx
import React, { useEffect, useState } from 'react';

import { Battery, BatteryWarning, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";


function searchDomOfCheckedInput(lv: string) {
  let lvElem = document.querySelectorAll(`input:checked + time[data-level="${lv}"]`);
  let lvNum = lvElem.length;
  return lvNum;
}

// データを取得する関数
const getStorageData = (key: string | string[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
};

const Digest: React.FC = () => {
  const [hotTaskIDs, setHotTaskIDs] = useState<string[][]>([]);
  const [checkedInputsCount, setCheckedInputsCount] = useState<{ [key: string]: number }>({});

  // コンポーネントの初回レンダリング時にデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStorageData('keyhottaskid');
        if (result.keyhottaskid) {
          setHotTaskIDs(result.keyhottaskid);
        }
      } catch (error) {
        console.error("エラー：", error);
      }
    };
    fetchData();
  }, []);

  // コンポーネントのマウント後にチェックされた入力を検索する
  useEffect(() => {
    const levels = ['lv10', 'lv5', 'lv4', 'lv3', 'lv2'];
    setTimeout(() => {
      const counts = levels.reduce((acc, level) => {
        acc[level] = searchDomOfCheckedInput(level);
        return acc;
      }, {});
      setCheckedInputsCount(counts);
    }, 1750); // 遅延 力業過ぎるけれどコード簡素化のためには割とベストプラクティス 全体の描画は約1.5秒で終わるので
  }, [hotTaskIDs]);

  if (hotTaskIDs.length === 0) {
    return <div></div>;
  }

  // タスクIDをレンダリングする関数
  const renderTaskIDs = (taskIDs: string[]) => (
    <ul>
      {taskIDs.map((taskID, index) => (
        <li key={index}>{taskID}</li>
      ))}
    </ul>
  );

  return (
    <div className='yuyu_table'>
      <table>
        <thead>
          <tr>
            <th>期限</th>
            <th>計</th>
            <th>完</th>
            <th>星</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td id="lv10-1"><span data-position="DigestCountdown"><Battery /><span>期限後2日</span></span></td>
            <td id="lv10-2">
              <span className='tooltip'>
                {hotTaskIDs[0]?.length || 0}
                <span className='tooltip-text'>
                  {renderTaskIDs(hotTaskIDs[0])}
                </span>
              </span>
            </td>
            <td id="lv10-3">{checkedInputsCount["lv10"] || 0}</td>
            <td id="lv10-4"></td>
          </tr>
          <tr>
            <td id="lv5-1"><span data-position="DigestCountdown"><BatteryWarning /><span>あと1日</span></span></td>
            <td id="lv5-2">
              <span className='tooltip'>
                {hotTaskIDs[1]?.length || 0}
                <span className='tooltip-text'>
                  {renderTaskIDs(hotTaskIDs[1])}
                </span>
              </span>
            </td>
            <td id="lv5-3">{checkedInputsCount["lv5"] || 0}</td>
            <td id="lv5-4"></td>
          </tr>
          <tr>
            <td id="lv4-1"><span data-position="DigestCountdown"><BatteryLow /><span>あと2日</span></span></td>
            <td id="lv4-2">
              <span className='tooltip'>
                {hotTaskIDs[2]?.length || 0}
                <span className='tooltip-text'>
                  {renderTaskIDs(hotTaskIDs[2])}
                </span>
              </span>
            </td>
            <td id="lv4-3">{checkedInputsCount["lv4"] || 0}</td>
            <td id="lv4-4"></td>
          </tr>
          <tr>
            <td id="lv3-1"><span data-position="DigestCountdown"><BatteryMedium /><span>あと5日</span></span></td>
            <td id="lv3-2">
              <span className='tooltip'>
                {hotTaskIDs[3]?.length || 0}
                <span className='tooltip-text'>
                  {renderTaskIDs(hotTaskIDs[3])}
                </span>
              </span>
            </td>
            <td id="lv3-3">{checkedInputsCount["lv3"] || 0}</td>
            <td id="lv3-4"></td>
          </tr>
          <tr>
            <td id="lv2-1"><span data-position="DigestCountdown"><BatteryFull /><span>あと14日</span></span></td>
            <td id="lv2-2">
              <span className='tooltip'>
                {hotTaskIDs[4]?.length || 0}
                <span className='tooltip-text'>
                  {renderTaskIDs(hotTaskIDs[4])}
                </span>
              </span>
            </td>
            <td id="lv2-3">{checkedInputsCount["lv2"] || 0}</td>
            <td id="lv2-4"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Digest;
