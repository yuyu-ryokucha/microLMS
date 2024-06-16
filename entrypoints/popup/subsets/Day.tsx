// /entrypoints/components/Day.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import DayTimetable from './DayTimetable';

interface DayProps {
    day: string;
}
const dayMap = {
  Mon: '月曜',
  Tue: '火曜',
  Wed: '水曜',
  Thu: '木曜',
  Fri: '金曜',
  Sat: '土曜',
  Other: 'その他'
} as const;

const Day: React.FC<DayProps> = ({day}) => {

  const dayInJP = dayMap[day as keyof typeof dayMap];

  return (
    <>

      <Card className='mb-4'>
        <CardHeader><CardTitle>{dayInJP}</CardTitle><CardDescription>時間割</CardDescription></CardHeader>
        <CardContent>
          <ol data-position="ClassList" className="marker:text-blue-600 list-decimal list-inside text-gray-800 dark:text-white">

              <li id={`${day}1`} key={`${day}1`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="1" /></li>
              <li id={`${day}2`} key={`${day}2`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="2" /></li>
              <li id={`${day}3`} key={`${day}3`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="3" /></li>
              <li id={`${day}4`} key={`${day}4`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="4" /></li>
              <li id={`${day}5`} key={`${day}5`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="5" /></li>
              <li id={`${day}6`} key={`${day}6`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="6" /></li>
              <li id={`${day}7`} key={`${day}7`} className='list-item whitespace-nowrap overflow-x-scroll'><DayTimetable day={day} period="7" /></li>

          </ol>
          </CardContent>
        <CardFooter></CardFooter>
      </Card>
      
    </>
  );
};

export default Day;

