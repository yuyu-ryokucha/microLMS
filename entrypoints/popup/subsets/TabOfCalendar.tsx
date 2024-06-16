// /entrypoints/components/TabOfCalendar.tsx

import React, { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from 'dayjs';
import Calendar from 'react-calendar';

import Digest from './Digest';
import './TabOfCalendar.css';

type MonthItem = {
  [key: string]: { text: string };
};

const TabOfCalendar: React.FC = () => {
  const [value, setValue] = useState<Date | null>(new Date());
  const [calendarItem, setCalendarItem] = useState<MonthItem>({});

  const updateData = async () => {
    try {
      const classResult = await new Promise<any>((resolve, reject) => {
        chrome.storage.local.get('keyclass', (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      // 途中で機能を大幅軽量化したところ残骸で暗黒化している
      const ArrayClassID = classResult.keyclass.map((item: { ClassId: string }) => item.ClassId);

      const ArrayDeadline: Date[] = [];
      const ArrayTaskIDOfLv50: any[] = [], ArrayTaskIDOfLv5: any[] = [], ArrayTaskIDOfLv4: any[] = [], ArrayTaskIDOfLv3: any[] = [], ArrayTaskIDOfLv2: any[] = [];

      for (const ClassID of ArrayClassID) {
        const keynamebyclassid = "keybyclassid" + ClassID;
        const result = await new Promise<any>((resolve, reject) => {
          chrome.storage.local.get(keynamebyclassid, (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
        const ArraySection = result[keynamebyclassid];

        if (ArraySection) {
          for (const Section of ArraySection) {
            for (const objTask of Section.SectionTasks) {
              if (objTask.TaskFinallineRaw) {
                const deadlineDate = new Date(objTask.TaskFinallineRaw);
                ArrayDeadline.push(deadlineDate);

                const now = new Date();
                const TimestampDiff = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                const TaskNameID = Section.ClassID + "@" + objTask.TaskName;

                if (TimestampDiff < 0) {
                  if (TimestampDiff >= -48) { ArrayTaskIDOfLv50.push(TaskNameID);
                  }
                } else if (TimestampDiff < 24) { ArrayTaskIDOfLv5.push(TaskNameID);
                } else if (TimestampDiff < 48) { ArrayTaskIDOfLv4.push(TaskNameID);
                } else if (TimestampDiff < 120) { ArrayTaskIDOfLv3.push(TaskNameID);
                } else if (TimestampDiff < 336) { ArrayTaskIDOfLv2.push(TaskNameID);
                } 
              }
            }
          }
        }
      }

      const ArrayHotTaskID = [ArrayTaskIDOfLv50, ArrayTaskIDOfLv5, ArrayTaskIDOfLv4, ArrayTaskIDOfLv3, ArrayTaskIDOfLv2];
      chrome.storage.local.set({ "keyhottaskid": ArrayHotTaskID }, () => {});

      ArrayDeadline.sort((a, b) => a.getTime() - b.getTime());
      const ArrayDeadlineItem: MonthItem = {};
      ArrayDeadline.forEach((date) => {
        const formattedDate = date.toISOString().split('T')[0];
        if (ArrayDeadlineItem[formattedDate]) {
          ArrayDeadlineItem[formattedDate].text = (parseInt(ArrayDeadlineItem[formattedDate].text) + 1).toString();
        } else {
          ArrayDeadlineItem[formattedDate] = { text: '1' };
        }
      });
      chrome.storage.local.set({ "Class": ArrayDeadlineItem }, () => {});

      setCalendarItem(ArrayDeadlineItem);

    } catch (error) {
      console.error('カレンダーのデータ解析でエラー：', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          chrome.storage.local.get('Class', (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
        if (result.Class) {
          setCalendarItem(result.Class);
        }
      } catch (error) {
        console.error('カレンダーのデータ取得でエラー：', error);
      }
    };
    fetchData();
  }, []);

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const targetDate = dayjs(date).format('YYYY-MM-DD');
      return calendarItem[targetDate] && calendarItem[targetDate].text ? (
        <p><span data-deadlineitem={calendarItem[targetDate].text} className="deadlineitem">{calendarItem[targetDate].text}</span></p>
      ) : null;
    }
    return null;
  };

  const onChange = (value: any, _event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const newValue = value as Date | null;
    setValue(newValue);
  };

  return (
    <>
      <Card className='mb-4'>
        <CardHeader className='pb-4'><CardTitle>期限カレンダー</CardTitle><CardDescription></CardDescription></CardHeader>
        <CardContent className='p-4'>
          <div>
            <Calendar
              onChange={onChange}
              minDetail="month"
              value={value}
              locale="ja-JP"
              formatDay={(locale: any, date) => {
                return dayjs(date).locale(locale).format('D');
              }}
              tileContent={getTileContent}
              calendarType="gregory"
            />
          </div>
        </CardContent>
        <CardFooter className='p-4'>
          <Button variant="outline" onClick={updateData}>データ反映</Button>
        </CardFooter>
      </Card>

      <Card className='mb-4'>
        <CardHeader><CardTitle>期限の近い課題</CardTitle><CardDescription></CardDescription></CardHeader>
        <CardContent>
          <Digest/>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={updateData}>データ反映</Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default TabOfCalendar;