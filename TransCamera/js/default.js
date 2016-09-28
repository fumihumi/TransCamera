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
    var appFolder = Windows.Storage.ApplicationData.current.localFolder;

    var imgCapture, width, height, ctx, results = [];
    var accessToken;

    // キャンバスクリック時のイベントハンドラ
    function canvasMouseDown(evt) {

    }

    /**
     * メイン画面描画用関数
     *  撮影画像があるときはその画像を表示
     */
    function repaint() {
        if (!imgCapture) {
            return;
        }

        ctx.drawImage(imgCapture, 0, 0, width, height);
    }

    // カメラ撮影用コールバック関数
    function takeNewPicture() {
        // canvasのサイズ設定、撮影時の縦横比率設定
        imgCapture = document.getElementById("imgCapture");
        var canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        width = canvas.parentNode.offsetWidth;
        height = canvas.parentNode.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.onmousedown = canvasMouseDown;

        var cam = Windows.Media.Capture.CameraCaptureUI();
        cam.photoSettings.allowCropping = true;
        var aspectRatio = { width: width, height: height };

        cam.photoSettings.croppedAspectRatio = aspectRatio;
        cam.photoSettings.maxResolution = Windows.Media.Capture.CameraCaptureUIMaxPhotoResolution.highestAvailable;
        cam.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo)
            .then(function (data) {
                if (data) {
                    document.getElementById("imgCapture").src = window.URL.createObjectURL(data)

                    appFolder.createFileAsync("capture.jpg",
                        Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                            data.copyAndReplaceAsync(file)
                        }, function (error) {
                            console.log(error)
                        })
                }
            })
    }

    //SPLIT VIEW
    var mySplitView = window.mySplitView = {
        splitView: null,
        takePicture: WinJS.UI.eventHandler(function (ev) {
            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-settings");
            // カメラアイコンクリック時のコールバック
            // カメラを起動してファイルに保存するまでの処理をここから開始します。
            takeNewPicture();
        }),
        recognize: WinJS.UI.eventHandler(function (ev) {
            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-settings");
            // 地球アイコンクリック時のコールバック
            // 画像認識、翻訳といった処理をここから開始します。

        }),
        settings: WinJS.UI.eventHandler(function (ev) {
            document.getElementById("app").classList.add("show-settings");
            document.getElementById("app").classList.remove("show-home");
            // 設定アイコンクリック時のコールバック
            // もし何らかの設定が必要なときはここから開始します。

        }),
    };
    //END SPLIT VIEW


    //processAll
    WinJS.UI.processAll().then(function () {
        mySplitView.splitView = document.querySelector(".splitView").winControl;
        new WinJS.UI._WinKeyboard(mySplitView.splitView.paneElement);
        setInterval(repaint, 1000);
    });

})();