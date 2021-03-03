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
		document.querySelector("#tagInc").addEventListener("click", (event) => {
			if (this.currentIndex >= this.tagsArray.length - 1) {
				console.log("Already at last tag, can't go forwards any further!");
			} else {
				this.currentIndex += 1;
				this.goToTagAtIndex(this.currentIndex);
			}
		});
		document.querySelector("#tagDec").addEventListener("click", (event) => {
			if (this.currentIndex == 0) {
				console.log("Already at first tag, can't go back any further!");
			} else {
				this.currentIndex -= 1;
				this.goToTagAtIndex(this.currentIndex);
			}
		});
		// this.videoPlayer = document.querySelector("#player");
		this.tagsArray = [];
		this.videoID = null;
		this.currentIndex = 0;
	}
	setCurrentVideo (ytID) {
		console.log("Now playing: " + ytID);
		this.videoID = ytID;
		// this.videoPlayer.src = `https://www.youtube.com/embed/${ytID}`;
		player.loadVideoById(ytID, 0);
		this.showPlayer();
	}
	resetTagList () {
		this.tagsArray = [];
	}
	addTagToList (tag) {
		this.tagsArray.push(tag)
	}
	goToFirstTag () {
		if (this.tagsArray[0]){
			console.log(`Jumping to tag ${this.tagsArray[0].name} at time ${this.tagsArray[0].time}`);
			//this.videoPlayer.src = `https://www.youtube.com/embed/${this.videoID}?t=${this.tagsArray[0].time}`;
			player.seekTo(this.tagsArray[0].time);
			player.playVideo();
		} else {
			console.log("No tags loaded!");
		}
	}
	goToTagAtIndex (index) {
		if (this.tagsArray[index]) {
			console.log(`Jumping to tag ${this.tagsArray[index].name} at time ${this.tagsArray[index].time}`);
			this.currentIndex = index;
			// this.videoPlayer.src = `https://www.youtube.com/embed/${this.videoID}?t=${this.tagsArray[index].time}`;
			player.seekTo(this.tagsArray[index].time);
			player.playVideo();
		} else {
			console.error(`That tag doesn't exist. (Tried accessing tag at index ${index} of the tag list)`);
		}
	}
	hidePlayer () {
		document.querySelector("#player").style.display =  "none";
		document.querySelector("#tagDec").style.display = "none";
		document.querySelector("#tagInc").style.display = "none";
		document.querySelector("#videoPlaceholder").style.display = "inline-block";
	}
	showPlayer () {
		document.querySelector("#player").style.display =  "block";
		document.querySelector("#tagDec").style.display = "block";
		document.querySelector("#tagInc").style.display = "block";
		document.querySelector("#videoPlaceholder").style.display = "none";
	}

}
nirb.TaggerParser = class {
	constructor() {
		this.taggerRegex = /(?:Tags)?\nhttps:\/\/www.youtube.com\/watch\?v=(.*)\sstart\stime:\s(\d\d:\d\d:\d\d\s\w*)\s\((\d\d)\)\n((?:.|\n)*)/gm;
		this.tagListRegex = /(.*?)(?:(\d{1,2})h)?(?:(\d{1,2})m)?(?:(\d{1,2})s)$/;
		this.numTags = 0;
		this.regexRetry = 0;
		document.querySelector("#submitTaggerInput").addEventListener('click', (event) => {
			const taggerTextArea = document.querySelector("#taggerInput");
			// console.log("button pressed");
			// console.log(taggerTextArea.value);
			this.parseVideoDetails(taggerTextArea.value);
		});
	}

	parseVideoDetails(taggerString) {
		console.log(taggerString + ", appling regex " + this.taggerRegex);

		const captureArray = this.taggerRegex.exec(taggerString);
		if (captureArray == null) {
			this.regexRetry++;
			if(this.regexRetry > 10) {
				this.regexRetry = 0;
				window.alert("Failed to parse Korotagger input, bad formatting?");
				return;
			}
			this.parseVideoDetails(taggerString); // weird stupid fix because regex doesn't like parsing the first time around
			return;
		}
		console.log(captureArray);
		const videoId = captureArray[1];
		nirb.YTManagerSingleton.setCurrentVideo(videoId);
		const startTime = captureArray[2];
		this.numTags = captureArray[3];
		const rawTagString = captureArray[4];
		this.parseTags(rawTagString);
	}

	parseTags(rawTagString) {
		const rawTagArray = rawTagString.split("\n");
		console.log("Parsing over array:")
		console.log(rawTagArray);
		nirb.YTManagerSingleton.resetTagList(); // clear old list if there was one
		for (let i = 0; i<rawTagArray.length; i++) {
			let tagHours = 0;
			let tagMinutes = 0;
			let tagArray = this.tagListRegex.exec(rawTagArray[i]);
			console.log("Parsed tag as: ", tagArray);
			if (tagArray[2]) {
				tagHours = parseInt(tagArray[2]); // if the tag has an hour field, set the hour field
			}
			if (tagArray[3]) {
				tagMinutes = parseInt(tagArray[3]); // if the tag has an minute field, set the minute field
			}
			let tagSeconds = parseInt(tagArray[4])
			let tagTotalSeconds = (tagHours * 3600) + (tagMinutes * 60) + tagSeconds; //tag will always have a seconds field
			const newTag = new nirb.TSTag(tagArray[1], tagTotalSeconds, tagHours, tagMinutes, tagSeconds);
			console.log("adding tag: " + newTag);
			nirb.YTManagerSingleton.addTagToList(newTag);
		}
		console.log(nirb.YTManagerSingleton.tagsArray);
	}
}

// data holder for tag info
nirb.TSTag = class {
	constructor(tagName, tagTime, tagHours, tagMinutes, tagSeconds) {
		this.name = tagName;
		this.time = tagTime;
		this.hours = tagHours;
		this.minutes = tagMinutes;
		this.seconds = tagSeconds;
	}
}
/* Main */
/** function and class syntax examples */
nirb.main = function () {
	console.log("Ready");
	this.YTManagerSingleton = new nirb.YTManager();
	this.YTManagerSingleton.hidePlayer();
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
