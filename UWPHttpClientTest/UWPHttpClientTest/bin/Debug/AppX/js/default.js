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
			init();
		}
	};

	app.oncheckpoint = function (args) {
		//TODO: このアプリケーションは中断しようとしています。ここで中断中に維持する必要のある状態を保存します。
		// WinJS.Application.sessionState オブジェクトを使用している可能性があります。このオブジェクトは、中断の間自動的に保存され、復元されます。
		//ご使用のアプリケーションを中断する前に非同期の操作を完了する必要がある場合は、args.setPromise() を呼び出してください。
	};

	app.start();

	function init() {
	    document.getElementById("send").onclick = function () {
	        console.log("HELLO");
	        var uri = new Windows.Foundation.Uri("http://localhost/php/board.html");
	        var client = new Windows.Web.Http.HttpClient();
	        client.getStringAsync(uri).done(function (data) {
	            console.log(data);
	        },function error(result) {
	            (new Windows.UI.Popups.MessageDialog("Non-existent content", "Error")).showAsync().done();
	            return;
	        });
	    }
	}
})();
