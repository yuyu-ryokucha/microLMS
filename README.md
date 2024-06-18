# microLMS：関大LMSの課題をわかりやすく

## これは何？

* 関西大学のe-Learningシステム｢**関大LMS**｣での課題の期限の管理をサポートするブラウザ拡張機能。
* **一方向へのスクロールだけで**全ての情報を確認できる洗練されたインターフェースがポイント。
* こだわりの設計で大学側のサーバーへの負荷は実質ゼロ。関大LMSを普通に利用しているときに**ついでに**データを貯めるだけなので安心。

## インストール

* [Chrome Web Store](https://chromewebstore.google.com/detail/microlms/cfklpfmfimgdclelgdfmdgcamokkeiea)

## 利用方法

### パソコン

1. microLMS をインストールしてChromeに追加する。
2. 初期設定をする。新たに 関大LMSにログインしてトップページを開く。
3. そこで画面右上のアイコンから microLMS を起動して時間割のデータが反映されていれば完了。
4. 課題のデータを反映させるには該当する授業ページを開くだけでOK。

### スマホ

* 単純な作りなのでモバイルでパソコン用の拡張機能を動かせると謳うアプリ上でもそこそこ動作する。ただし､正常に動作しなくてもアプリ側の問題の可能性もあり。
* iPhoneとiPadでは｢[Orion Browser](https://apps.apple.com/jp/app/orion-browser-by-kagi/id1484498200)｣､Androidでは｢[Kiwi Browser](https://play.google.com/store/apps/details?id=com.kiwibrowser.browser)｣が有名でおすすめ。
* ｢[Firefox for Android](https://play.google.com/store/apps/details?id=org.mozilla.firefox)｣と｢[Microsoft Edge Canary](https://play.google.com/store/apps/details?id=com.microsoft.emmx.canary)｣については現時点では動作は不十分。

### その他

詳しくはソフト内などを参照。

## 開発

```shell
npm install
```

## ライセンス

* Apache License 2.0

## 謝辞

* [React](https://github.com/facebook/react)
* [WXT](https://github.com/wxt-dev/wxt)
* [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)
* [shadcn/ui](https://github.com/shadcn-ui/ui)
* [Preline UI](https://github.com/htmlstreamofficial/preline)
* [Lucide Icons](https://github.com/lucide-icons/lucide)
* [IBM Plex](https://github.com/IBM/plex)
* [react-calendar](https://github.com/wojtekmaj/react-calendar)
* [react-scrollspy-navigation](https://github.com/toviszsolt/react-scrollspy)
* [Day.js](https://github.com/iamkun/dayjs)