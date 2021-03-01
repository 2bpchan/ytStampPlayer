/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var nirb = nirb || {};

/** globals */
nirb.YTManagerSingleton = null;
nirb.TaggerParserSingleton = null;

/** function and class syntax examples */
nirb.functionName = function () {
	/** function body */
};

nirb.YTManager = class {
	constructor() {
		// TODO set up some click listeners here for tag jumping controls later
		this.videoPlayer = document.querySelector("#player");
	}
	setCurrentVideo (ytID) {
		console.log("Now playing: " + ytID);
		this.videoPlayer.src = `https://www.youtube.com/embed/${ytID}`;
	}
}
nirb.TaggerParser = class {
	constructor() {
		this.taggerRegex = /(?:Tags)?\nhttps:\/\/www.youtube.com\/watch\?v=(.*)\sstart\stime:\s(\d\d:\d\d:\d\d\s\w*)\s\((\d\d)\)\n((?:.|\n)*)/gm;
		this.tagListRegex = /aaa/;
		document.querySelector("#submitTaggerInput").addEventListener('click', (event) => {
			const taggerTextArea = document.querySelector("#taggerInput");
			console.log("button pressed");
			//console.log(taggerTextArea.value);
			this.parseVideoDetails(taggerTextArea.value);
		});
	}

	parseVideoDetails(taggerString) {
		console.log(taggerString + ", appling regex " + this.taggerRegex);

		const captureArray = this.taggerRegex.exec(taggerString);
		// console.log(captureArray);
		const videoId = captureArray[1];
		nirb.YTManagerSingleton.setCurrentVideo(videoId);
	}
}

/* Main */
/** function and class syntax examples */
nirb.main = function () {
	console.log("Ready");
	this.YTManagerSingleton = new nirb.YTManager();
	this.TaggerParserSingleton = new nirb.TaggerParser();
	
	// document.querySelector("#testButton").addEventListener('click', (event) => {
	// 	console.log("pressed button");
		
	// 	try {
	// 		player.loadVideoById("C_6SLgOZ3HY", 0);
	// 		// player.loadVideoById(videoId:String, startSeconds:Number)
	// 	} catch (err) {
	// 		console.log("player hasn't loaded yet, probably a better way to catch this")
	// 	}
	// });


};

nirb.main();
