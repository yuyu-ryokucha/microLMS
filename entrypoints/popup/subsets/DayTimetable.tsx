// /entrypoints/components/DayTimetable.tsx

import React, { useEffect, useState } from 'react';

import SectionAndTask from './SectionAndTask';

const LMSURL = 'https://kulms.tl.kansai-u.ac.jp';

interface DayTimetableProps {
  day: string;
  period: string;
}
interface ClassInfo {
  ClassName: string;
  ClassId: string;
  ClassDayOfWeekEN: string;
  ClassPeriod: string;
}

const DayTimetable: React.FC<DayTimetableProps> = ({ day, period }) => {
  const [currentClass, setCurrentClass] = useState<ClassInfo | null>(null);

  useEffect(() => {
    chrome.storage.local.get('keyclass', ({ keyclass }) => {
      setCurrentClass(keyclass?.find(
        ({ ClassDayOfWeekEN, ClassPeriod }: ClassInfo) => ClassDayOfWeekEN === day && ClassPeriod === period
      ) || null);
{/* デバッグ用
      console.log("keyclass");
      console.log(keyclass);
      console.log(JSON.stringify(keyclass[0]));
*/}
    });
  }, [day, period]);

  return (
    <>
      {currentClass && (
        <a
          data-position="ClassName"
          href={`${LMSURL}/webclass/login.php?group_id=${currentClass.ClassId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-blue-900"
        >
          {currentClass.ClassName}
        </a>
      )}
      {currentClass && <SectionAndTask classid={currentClass.ClassId || ""} />}
    </>
  );
};

export default DayTimetable;

