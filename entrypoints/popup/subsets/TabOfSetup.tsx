// /entrypoints/components/TabOfSetup.tsx

import React, { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import { Link } from "lucide-react";
import { Clock9, Calendar, CaseSensitive, FileText } from "lucide-react";
import { Scale } from "lucide-react";
import { Trash2 } from "lucide-react";

const TabOfSetup: React.FC = () => {
  const [settings, setSettings] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const keys = ['setting_timetablestandby','setting_renewal_disabled','setting_pdfexpansion','setting_customfont',];
    chrome.storage.local.get(keys, (result) => {
      const newSettings: { [key: string]: boolean } = {};
      keys.forEach((key) => {
        newSettings[key] = result[key] !== undefined ? result[key] : false;
      });
      setSettings(newSettings);
    });
  }, []);

  const handleSwitchChange = (key: string, newValue: boolean) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: newValue,
    }));
    chrome.storage.local.set({ [key]: newValue }, () => {
      console.log(`${key} is set to ${newValue}`);
    });
  };

  // データを全削除する 警告付き
  const handleResetData = () => {
    if (window.confirm("本当に実行しますか？この操作を取り消すことはできません。")) {
      chrome.storage.local.clear(() => {
        console.log('操作は完了しました。');
        setSettings({});
      });
    }
  };

  return (
    <>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>その他</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>

          <Alert className='mb-4'>
            <Link className="h-4 w-4" />
            <AlertTitle className='mb-3'>リンク集</AlertTitle>
            <AlertDescription>
              <p className='mb-1'>関西大学総合情報学部に関連するリンクのまとめです。</p>
              <ul className="mb-1 ml-6 list-disc [&>li]:mt-1">
                <li><a target='_blank' rel="noopener" href='https://kulms.tl.kansai-u.ac.jp/webclass/login.php'>関大LMS</a></li>
                <li><a target='_blank' rel="noopener" href='https://kulms.tl.kansai-u.ac.jp/webclass/informations.php'>関大LMS お知らせ</a></li>
                <li><a target='_blank' rel="noopener" href='https://info.kansai-u.ac.jp/login'>関西大学インフォメーションシステム</a></li>
                <li><a target='_blank' rel="noopener" href='https://uc-student.jp/kansai-u/'>KICSS キャリア支援システム</a></li>
                <li><a target='_blank' rel="noopener" href='https://outlook.office.com/Trash2/'>Outlook 関大Webメール</a></li>
                <li><a target='_blank' rel="noopener" href='https://sj.edu.kutc.kansai-u.ac.jp/2024/index.html'>SJ システム</a></li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className='mb-4'>
            <Clock9 className="h-4 w-4" />
            <AlertTitle className='mb-2'>時間割スタンバイの休止</AlertTitle>
            <AlertDescription>
              <p className='my-2'>WebClassのトップページを開いたときに時間割を取得し直さないようにします。このスイッチは新学期ごとに一度はOFFにする必要があります。</p>
              <Switch
                data-key="setting_timetablestandby"
                checked={settings.setting_timetablestandby || false}
                onCheckedChange={(newValue) => handleSwitchChange('setting_timetablestandby', newValue)}
                className='my-1'
              />
            </AlertDescription>
          </Alert>

          <Alert className='mb-4'>
            <Calendar className="h-4 w-4" />
            <AlertTitle className='mb-3'>本家サイトのスタイルなし</AlertTitle>
            <AlertDescription>
              <p className='mb-1'>本家のサイト内で課題の期限を色分けなどのマークアップを無効化します。</p>
              <Switch
                data-key="setting_renewal_disabled"
                checked={settings.setting_renewal_disabled || false}
                onCheckedChange={(newValue) => handleSwitchChange('setting_renewal_disabled', newValue)}
                className='my-1'
              />
            </AlertDescription>
          </Alert>

          <Alert className='mb-4'>
            <FileText className="h-4 w-4" />
            <AlertTitle className='mb-3'>PDFの枠の高さを拡張</AlertTitle>
            <AlertDescription>
              <p className='mb-1'>課題に添付されているPDFの枠の高さをより見やすく拡張します。</p>
              <Switch
                data-key="setting_pdfexpansion"
                checked={settings.setting_pdfexpansion || false}
                onCheckedChange={(newValue) => handleSwitchChange('setting_pdfexpansion', newValue)}
                className='my-1'
              />
            </AlertDescription>
          </Alert>

          <Alert className='mb-4'>
            <CaseSensitive className="h-4 w-4" />
            <AlertTitle className='mb-3'>フォントの最適化</AlertTitle>
            <AlertDescription>
              <p className='mb-1'>本家のサイト内のフォントを推しの IBM Plex Sans JP に置き換えます。</p>
              <Switch
                data-key="setting_customfont"
                checked={settings.setting_customfont || false}
                onCheckedChange={(newValue) => handleSwitchChange('setting_customfont', newValue)}
                className='my-1'
              />
            </AlertDescription>
          </Alert>

          <Alert className='mb-4'>
            <Scale className="h-4 w-4" />
            <AlertTitle className='mb-3'>クレジット</AlertTitle>
            <AlertDescription>
              <p className='mb-1'>このプロジェクトはオープンソースであり <a target='_blank' rel="noopener" href='https://github.com/yuyu-ryokucha/microLMS?tab=Apache-2.0-1-ov-file'>Apache License 2.0</a> でライセンスされています。</p>
              <ul className="mb-1 ml-6 list-disc [&>li]:mt-1">
                <li>TypeScript（言語､約65%）</li>
                <li>JavaScript（言語､約3%）</li>
                <li>CSS（言語､約30%）</li>
                <li><a target='_blank' rel="noopener" href='https://github.com/facebook/react'>React</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/wxt-dev/wxt'>WXT</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/tailwindlabs/tailwindcss'>Tailwind CSS</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/shadcn-ui/ui'>shadcn/ui</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/htmlstreamofficial/preline'>Preline UI</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/lucide-icons/lucide'>Lucide Icons</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/IBM/plex'>IBM Plex</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/wojtekmaj/react-calendar'>react-calendar</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/toviszsolt/react-scrollspy'>react-scrollspy-navigation</a></li>
                <li><a target='_blank' rel="noopener" href='https://github.com/iamkun/dayjs'>Day.js</a></li>
              </ul>
            </AlertDescription>
          </Alert>

        </CardContent>
        <CardFooter>
          <Button onClick={handleResetData}>
            <Trash2 className="mr-2 h-4 w-4" />全てのデータを削除
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default TabOfSetup;
