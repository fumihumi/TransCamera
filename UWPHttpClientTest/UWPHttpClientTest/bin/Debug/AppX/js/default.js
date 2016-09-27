// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232509
function () {
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
            init();
        }
    };

    app.oncheckpoint = function (args) {
        //TODO: このアプリケーションは中断しようとしています。ここで中断中に維持する必要のある状態を保存します。
        // WinJS.Application.sessionState オブジェクトを使用している可能性があります。このオブジェクトは、中断の間自動的に保存され、復元されます。
        //ご使用のアプリケーションを中断する前に非同期の操作を完了する必要がある場合は、args.setPromise() を呼び出してください。
    };

    app.start();

    window.onload = function init() {

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
        });
    }
    $('send').click(function () {
        var text = $('a').text;

        data = { text: text, to: "en", from: "ja" };

        $.ajax({
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            url: 'http://api.microsofttranslator.com/v2/Http.svc/Translate',
            data: data
        }).done(function (data) {
            var json = JSON.parse(data);
            console.log(json);
        });
    });


}