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
                init();
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

    var accessToken;

    function init(){

        var uri = new Windows.Foundation.Uri("https://datamarket.accesscontrol.windows.net/v2/OAuth2-13");
        var client = new Windows.Web.Http.HttpClient();
        var keyValue = (new Windows.Web.Http.HttpClient()).defaultRequestHeaders;
        keyValue["client_id"] = "KanaCon";
        keyValue["client_secret"] = "ACyJeANuFz23Tnv19saT1/yDhoQ/BrLfKXyYlKvNIOM=";
        keyValue["scope"] = "http://api.microsofttranslator.com";
        keyValue["grant_type"] = "client_credentials";

        var httpContent = new Windows.Web.Http.HttpFormUrlEncodedContent(keyValue);

        client.postAsync(uri, httpContent).then(function (res) {
            return res.content.readAsStringAsync();
        }).then(function (response) {
            var r = JSON.parse(response);
            return r.access_token;
        }).then(function (token) {
            accessToken = token;
        }).done(null, function (err) {
            console.log(err);
        })
    }

    var app = WinJS.Application;

    /**
     * ここからcanvas部門
     */
    var ctx, canvas = [],
        results = [];
    var appFolder = Windows.Storage.ApplicationData.current.localFolder;

    //初期化関数
    $(function () {
        // Canvasのコンテキスト取得とクリック時のイベントハンドラ登録
        canvas = document.getElementById("picture");
        ctx = canvas.getContext("2d");

        //canvasの上でマウスが押されたとき
        canvas.onmousedown = function (e) {
            for (var i = 0; i < results.length; i++) {
                var x = e.offsetX,
                    y = e.offsetY;
                if (results[i].rect.isHit(x, y)) {
                    document.getElementById("selectedText").textContent = results[i].text;

                    var text = $('#selectedText').text(),
                    To = $('#languageTranslate [name=group1]:checked').val();
                    var parameters = {
                        text: text,
                        to: To,
                        from: "ja"
                    };

                    $.ajax({
                        headers: {
                            'Authorization': 'Bearer ' + accessToken
                        },
                        url: 'http://api.microsofttranslator.com/v2/Ajax.svc/Translate',
                        data: parameters,
                        dataType: "json",
                        success: function (result) {
                            $('#translateText').text(result);
                            // 話すための機能をインスタンス化色々と値を設定.

                        }
                    });


                }
            }
        }
    })

    //SPLIT VIEW

    var mySplitView = window.mySplitView = {
        splitView: null,
        takePicture: WinJS.UI.eventHandler(function (ev) {
            // カメラアイコンクリック時のコールバック
            // カメラを起動してファイルに保存するまでの処理をここから開始します。
            //magは倍率、fixは固定の意味
            var img, Hmag, Wmag, Hfix, Wfix;

            // 撮影と保存
            var captureUI = new Windows.Media.Capture.CameraCaptureUI();
            captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (data) {
                if (data) {
                    document.getElementById('imgCapture').src = window.URL.createObjectURL(data);
                    appFolder.createFileAsync("capture.jpg",
                        Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                            return data.copyAndReplaceAsync(file);
                        }).then(function () {
                            recognizeImage();
                        });
                }
            });

            // 描写と画像認識
            function recognizeImage() {
                appFolder.getFileAsync("capture.jpg").then(function (file) {
                    img = new Image();
                    img.src = file.path;
                    var h = img.naturalHeight;
                    var w = img.naturalWidth;
                    Hmag = 540 / h;
                    Wmag = 960 / w;
                    Hfix = Hmag * h;
                    Wfix = Wmag * w; //540px,960pxに固定
                    canvas.height = Hfix;
                    canvas.width = Wfix;
                    canvas.style.height = Hfix + "px";
                    canvas.style.width = Wfix + "px";
                    repaint([]);
                    return file.openReadAsync();
                })
                    .then(function (stream) {
                        var blob = MSApp.createBlobFromRandomAccessStream("image/jpeg", stream);
                        return WinJS.xhr({
                            type: "POST",
                            url: "https://api.projectoxford.ai/vision/v1.0/ocr?language=ja",
                            headers: {
                                "Content-Type": "application/octet-stream",
                                "Ocp-Apim-Subscription-Key": "31060de8823143e88391bec444d19298",
                            },
                            data: blob,
                            responseType: "json"
                        });
                    })
                    .then(function (request) {
                        // 画像解析結果
                        extraction(request.response);
                    }, function (error) {
                        alert(error);
                    });
            }

            // JSONから抽出
            function extraction(json_data) {
                for (var i = 0; i < json_data.regions.length; i++) {
                    var r = json_data.regions[i];
                    for (var j = 0; j < r.lines.length; j++) {
                        var line = r.lines[j];
                        var linebox = line.boundingBox;
                        var lineStr = "";
                        for (var k = 0; k < line.words.length; k++) {
                            var word = line.words[k];
                            lineStr += word.text;
                        }

                        var p = linebox.split(",");
                        //resultsに座標とテキストを格納する
                        //スケーリングを行う(x,y,width,height)
                        results.push({
                            rect: new Rectangle(
                                parseFloat(p[0] * Wmag),
                                parseFloat(p[1] * Hmag),
                                parseFloat(p[2] * Wmag),
                                parseFloat(p[3] * Hmag)),
                            text: lineStr
                        })
                    }
                }

                document.getElementById("list").innerHTML = "";
                for (var i = 0; i < results.length; i++) {
                    var li = document.createElement("li");
                    li.textContent = results[i].text;
                    document.getElementById("list").appendChild(li);
                }
                repaint(results);
            }

            function repaint(results) {
                ctx.fillStyle = "white";
                if (img) {
                    ctx.drawImage(img, 0, 0, Wfix, Hfix);
                }
                ctx.strokeStyle = "red";
                if (results && results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        var r = results[i].rect;
                        ctx.strokeRect(r.x, r.y, r.w, r.h);
                    }
                }
            }

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

            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-settings");
        }),
        /**
         *ここまでcanvas部門
         */
        recognize: WinJS.UI.eventHandler(function (ev) {
            // 地球アイコンクリック時のコールバック
            // 画像認識、翻訳といった処理をここから開始します。
            // unsupported.
            var transText = $('#translateText').text();
            speak(transText);

            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-settings");
        }),
        settings: WinJS.UI.eventHandler(function (ev) {
            // 設定アイコンクリック時のコールバック
            // もし何らかの設定が必要なときはここから開始します。

            //var msgBox = new Windows.UI.Popups.MessageDialog("設定アイコン押下時の処理を書きます");
            //msgBox.showAsync()

            document.getElementById("app").classList.add("show-settings");
            document.getElementById("app").classList.remove("show-home");

        }),
    };
    //END SPLIT VIEW

    function speak(text) {
        var msg = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        msg.volume = document.querySelector('#volume').value / 20 + 0.5;
        //msg.text = document.querySelector('#translateText').innerHTML;
        msg.text = text;
        msg.rate = document.querySelector('#rate').value / 20 + 0.5;
        //  msg.pit document.querySelector('#text').value; // しゃべる内容
        msg.lang = $('#languageTranslate [name=group1]:checked').val();
        //msg.lang = document.querySelector('#selectVoice').value; // en-US or ja-UP

        // 終了した時の処理
        msg.onend = function (event) {
            console.log('speech end. time=' + event.elapsedTime + 's');
        }
        speechSynthesis.speak(msg); // テキストスピーチ開始

    }

    //processAll
    WinJS.UI.processAll().then(function () {
        mySplitView.splitView = document.querySelector(".splitView").winControl;
        new WinJS.UI._WinKeyboard(mySplitView.splitView.paneElement);
    });

})();
