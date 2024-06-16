// /entrypoints/popup/App.tsx

import React from 'react';
import ScrollSpy from 'react-scrollspy-navigation';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import TabOfCalendar from './subsets/TabOfCalendar';
import TabOfSetup from './subsets/TabOfSetup';
import Day from './subsets/Day';
import './App.css';

const App: React.FC = () => {

    const openSidePanel = () => {
        if (chrome?.sidePanel) {
            chrome.windows.getCurrent({}, (window) => {
                chrome.sidePanel.open({ windowId: window.id })
                    .then(() => {
                        console.log("サイドパネルを開きました。");
                    })
                    .catch((error) => {
                        console.error("サイドパネルを開くときにエラーが発生しました。：", error);
                    });
            });
        } else {
            console.log("この環境はサイドパネルに対応していません。");
        }
    };

    return (
        <>
            <header className="yuyu_header">
                <div className="yuyu_header_inner">

                    <a className="yuyu_header_title" href="#" data-position="">
                        <img src="/icon-128.png" height={24} width={24} />
                        <h2>microLMS</h2>
                    </a>

                    <nav>
                        <ScrollSpy activeClass="active" rootMargin="20px">
                            <a href="#Mon">月</a>
                            <a href="#Tue">火</a>
                            <a href="#Wed">水</a>
                            <a href="#Thu">木</a>
                            <a href="#Fri">金</a>
                            <a href="#Sat">土</a>
                            <a href="#Other">他</a>
                        </ScrollSpy>
                    </nav>
                    <div>
                        <a href='#' onClick={openSidePanel}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-right-close"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" /></svg>
                        </a>
                    </div>

                </div>
            </header>

            <main id="main" className="mx-auto">

                <Tabs forceRenderTabPanel>
                    <TabList>
                        <Tab><span className='component_lucid-icon_wrapper'><i data-icon="clock-9"></i>時間割</span></Tab>
                        <Tab><span className='component_lucid-icon_wrapper'><i data-icon="calendar"></i>カレンダー</span></Tab>
                        <Tab><span className='component_lucid-icon_wrapper'><i data-icon="settings"></i>その他</span></Tab>
                    </TabList>

                    <TabPanel>
                        <div id="Mon"><Day day="Mon" /></div>
                        <div id="Tue"><Day day="Tue" /></div>
                        <div id="Wed"><Day day="Wed" /></div>
                        <div id="Thu"><Day day="Thu" /></div>
                        <div id="Fri"><Day day="Fri" /></div>
                        <div id="Sat"><Day day="Sat" /></div>
                        <div id="Other"><Day day="Other" /></div>
                    </TabPanel>

                    <TabPanel><TabOfCalendar /></TabPanel>
                    <TabPanel><TabOfSetup /></TabPanel>

                </Tabs>

            </main>

            <footer className="yuyu_footer">
                <p>Copyright 2024 <a href="#">microLMS</a> by YUYU</p>
            </footer>

        </>
    );
};

export default App;