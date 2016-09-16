// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch) {
			if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
				//TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを初期化します。
			} else {
				// TODO: このアプリケーションは中断されてから終了しました。
				// スムーズなユーザー エクスペリエンスとなるよう、ここでアプリケーション状態を復元し、アプリが停止したようには見えないようにします。
			}
			args.setPromise(WinJS.UI.processAll());
		}
	};

	app.oncheckpoint = function (args) {
		//TODO: このアプリケーションは中断しようとしています。ここで中断中に維持する必要のある状態を保存します。
		// WinJS.Application.sessionState オブジェクトを使用している可能性があります。このオブジェクトは、中断の間自動的に保存され、復元されます。
		//ご使用のアプリケーションを中断する前に非同期の操作を完了する必要がある場合は、args.setPromise() を呼び出してください。
	};

	app.start();


})();


(function () {
    "use strict";

    var app = WinJS.Application;

    //SPLIT VIEW

    var mySplitView = window.mySplitView = {
        splitView: null,
        takePicture: WinJS.UI.eventHandler(function (ev) {
            // カメラアイコンクリック時のコールバック
            // カメラを起動してファイルに保存するまでの処理をここから開始します。
            var msgBox = new Windows.UI.Popups.MessageDialog("ここにカメラアイコン押下時の処理を書きます");
            msgBox.showAsync()

            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-settings");
        }),
        recognize: WinJS.UI.eventHandler(function (ev) {
            // 地球アイコンクリック時のコールバック
            // 画像認識、翻訳といった処理をここから開始します。
            var msgBox = new Windows.UI.Popups.MessageDialog("地球アイコン押下時の処理を書きます");
            msgBox.showAsync()

            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-settings");
        }),
        settings: WinJS.UI.eventHandler(function (ev) {
            // 設定アイコンクリック時のコールバック
            // もし何らかの設定が必要なときはここから開始します。
            var msgBox = new Windows.UI.Popups.MessageDialog("設定アイコン押下時の処理を書きます");
            msgBox.showAsync()

            document.getElementById("app").classList.add("show-settings");
            document.getElementById("app").classList.remove("show-home");

        }),
    };
    //END SPLIT VIEW


    //processAll
    WinJS.UI.processAll().then(function () {
        mySplitView.splitView = document.querySelector(".splitView").winControl;
        new WinJS.UI._WinKeyboard(mySplitView.splitView.paneElement);
    });

    app.start();
})();