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
        trailClicked: WinJS.UI.eventHandler(function (ev) {
            var trailId = ev.currentTarget.dataset.trailId;
            updateUI(allTrails[trailId]);
        }),
        homeClicked: WinJS.UI.eventHandler(function (ev) {
            //The home button has been clicked
            document.getElementById("app").classList.add("show-home");
            document.getElementById("app").classList.remove("show-trail");
        }),
    };


    //END SPLIT VIEW


    function updateUI(trail) {

        //add remove tags
        document.getElementById("app").classList.add("show-trail");
        document.getElementById("app").classList.remove("show-home");

        //update title
        var titleElt = document.body.querySelector(".trail-title");
        titleElt.textContent = trail.title;

        //update location
        var locationElt = document.body.querySelector(".trail-location");
        locationElt.textContent = trail.location;

        //update description
        var descriptionElt = document.body.querySelector(".trail-description");
        descriptionElt.textContent = trail.description;

        //update Rating
        var ratingElt = document.body.querySelector(".rating");
        ratingElt.winControl.averageRating = trail.averageRating;
        ratingElt.winControl.userRating = 0;
    }

    var trailNameToID = {
        "Snoqualmie Falls Trail": 0,
        "Foster Island Trail": 1,
        "Alki Trail": 2
    }

    var allTrails = [
        {
            title: "Snoqualmie Falls Trail", averageRating: 2, location: "Kirkland, WA", preview: "/images/SampleApp/Snoqualmie.jpg", pictureArray: [
                { type: "item", picture: "/images/SampleApp/Snoqualmie.jpg" },
                { type: "item", picture: "/images/SampleApp/Snoqualmie2.jpg" }

            ], description: "Snoqualmie Falls is one of Washington state's most popular scenic attractions. More than 1.5 million visitors come to the Falls every year. At the falls, you will find a two-acre park, gift shop, observation deck, the Salish Lodge and the famous 270 foot waterfall."
        },
        {
            title: "Foster Island Trail", averageRating: 4.5, location: "Bellevue, WA", preview: "/images/SampleApp/Foster.jpg", pictureArray: [
                 { type: "item", picture: "/images/SampleApp/Foster.jpg" },
                 { type: "item", picture: "/images/SampleApp/Foster2.jpg" }

            ], description: "Foster Island Trail is a 2 mile loop trail located near Seattle, Washington that features a lake and is good for all skill levels. The trail offers a number of activity options and is accessible year-round."
        },
        {
            title: "Alki Trail", averageRating: 1.5, location: "Seattle, WA", preview: "/images/SampleApp/Alki.jpg", pictureArray: [
                 { type: "item", picture: "/images/SampleApp/Alki.jpg" },
                 { type: "item", picture: "/images/SampleApp/Alki2.jpg" }
            ], description: "The Alki Trail rides along the northern and eastern shore of West Seattle along Alki Avenue. Largely riding on a widened sidewalk, separated from traffic by a parking lane and curb, traffic on the trail is separated for bikes and walkers, providing a less stressful experience for walkers and bikers alike. "
        }
    ]


    //processAll
    WinJS.UI.processAll().then(function () {
        mySplitView.splitView = document.querySelector(".splitView").winControl;
        new WinJS.UI._WinKeyboard(mySplitView.splitView.paneElement);
    });

    app.start();
})();