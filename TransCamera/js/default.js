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

    var languageIndex = 0, allVoices, audio, synth;
    var languageTranslate = ["en", "de", "de", "en"];

    /**
     * キャンバスクリック時のイベントハンドラ
     */
    function canvasMouseDown(e) {
        for (var i = 0 ; i < results.length ; i++) {
            if (results[i].rect.isHit(e.offsetX, e.offsetY)) {
                //speak(results[i].translated);
                alert(results[i].translated);
            }
        }
    }

    /**
     * 矩形の座標を保持するオブジェクト用のコンストラクタ
     */
    function Rectangle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.isHit = function (p, q) {
            if (this.x < p && p < this.x + this.w &&
                this.y < q && q < this.y + this.h) {
                return true;
            }
            return false;
        }
    }

    /**
     * ダイアログボックスを表示する（デバッグ用）
     */
    function alert(message) {
        var msgBox = new Windows.UI.Popups.MessageDialog(message);
        msgBox.showAsync();
    }

    /**
     * メイン画面描画用関数
     *  - 撮影画像があるときはその画像を表示
     *  - 認識領域があるときはその領域も表示
     */
    function repaint() {
        if (!imgCapture) {
            return;
        }

        ctx.drawImage(imgCapture, 0, 0, width, height);

        var scale = width / imgCapture.width;

        if (results && results.length > 0) {
            for (var i = 0 ; i < results.length ; i++) {
                var r = results[i].rect;

                ctx.font = "12px 'Times New Roman'";
                ctx.strokeStyle = "red";
                ctx.strokeRect(r.x, r.y, r.w, r.h);
                ctx.strokeText(results[i].text, r.x, r.y);

                if (results[i].translated) {
                    ctx.font = "24px 'Times New Roman'";
                    ctx.fillStyle = "yellow";
                    ctx.fillText(results[i].translated, r.x, r.y + 24);
                }
            }
        }
    }

    /**
     * 翻訳用のアクセストークンを取得する
     *  - アクセストークンはグローバル変数のaccessToekに保存
     *  - アプリ開始時に一度呼べばOK（本当はAccessTokenの有効期限で1回呼べばOK）
     */
    function getAccessToken() {
        var httpClient = new Windows.Web.Http.HttpClient();
        var keyValue = (new Windows.Web.Http.HttpClient()).defaultRequestHeaders;
        keyValue["client_id"] = "KanaConTranslator";
        keyValue["client_secret"] = "J7AffcizORZjK+V0LvsYfQp0Ag3BPWcgHW6AD++KSAM=";
        keyValue["scope"] = "http://api.microsofttranslator.com";
        keyValue["grant_type"] = "client_credentials";

        var httpContent = new Windows.Web.Http.HttpFormUrlEncodedContent(keyValue);

        var uri = new Windows.Foundation.Uri("https://datamarket.accesscontrol.windows.net/v2/OAuth2-13");
        httpClient.postAsync(uri, httpContent).then(
            function (res) {
                return res.content.readAsStringAsync();
            }).then(function (response) {
                var r = JSON.parse(response);
                return r.access_token;
            }).then(function (token) {
                accessToken = token;
            }).done(null, function (err) {
                alert(err);
            })
    }


    /**
     * カメラ撮影用コールバック関数
     */
    function takeNewPicture() {
        results = []

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

    /**
     * 画像認識関数
     *  - アプリフォルダに保存されているcapture.jpgをOCR認識して認識文字列を取得
     *  - それら文字列を翻訳Web-APIを使って翻訳
     */
    function recognizeImage() {
        appFolder.getFileAsync("capture.jpg").then(function (file) {
            return file.openReadAsync();
        }).then(function (stream) {
            var blob = MSApp.createBlobFromRandomAccessStream("image/jpeg", stream);
            return WinJS.xhr({
                type: "POST",
                url: "https://api.projectoxford.ai/vision/v1.0/ocr?language=ja",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Ocp-Apim-Subscription-Key": "31060de8823143e88391bec444d19298",
                },
                data: blob
            })

        }).then(function (response) {
            results = [];
            var data = JSON.parse(response.responseText);
            for (var i = 0 ; i < data.regions.length; i++) {
                var r = data.regions[i];
                for (var j = 0 ; j < r.lines.length ; j++) {
                    var line = r.lines[j];
                    var linebox = line.boundingBox;
                    var lineStr = "";
                    for (var k = 0 ; k < line.words.length ; k++) {
                        var word = line.words[k];
                        lineStr += word.text + " ";
                    }

                    var scale = width / imgCapture.width;
                    var p = linebox.split(",");
                    results.push({
                        rect: new Rectangle(
                            parseInt(p[0]) * scale,
                            parseInt(p[1]) * scale,
                            parseInt(p[2]) * scale,
                            parseInt(p[3]) * scale),
                        text: lineStr
                    })
                }
            }
            if (results.length == 0) {
                alert("nothing is recognized");
            }
            return results;

        }).then(function (results) {

            var to = languageTranslate[languageIndex];

            for (var i = 0 ; i < results.length ; i++) {
                var text = results[i].text;
                var options = "to=" + to +
                    "&from=ja" +
                    "&text=" + encodeURIComponent(text);

                var httpClient = new Windows.Web.Http.HttpClient();
                httpClient.defaultRequestHeaders.tryAppendWithoutValidation("Authorization", "Bearer " + accessToken);

                var f = function (i) {
                    return function (responseText) {
                        var p1 = responseText.indexOf(">");
                        var p2 = responseText.indexOf("</string>");
                        var str = responseText.substring(p1 + 1, p2);
                        results[i].translated = str;
                    }
                }
                var responseHandler = f(i);

                var uri = new Windows.Foundation.Uri("http://api.microsofttranslator.com/v2/Http.svc/Translate?" + options);
                httpClient.getAsync(uri).then(
                    function (res) {
                        return res.content.readAsStringAsync();
                    }).then(responseHandler).done(null, function (err) {
                        console.log(err);
                    })
            }

            repaint();
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
            recognizeImage();
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
        getAccessToken();
    });

})();