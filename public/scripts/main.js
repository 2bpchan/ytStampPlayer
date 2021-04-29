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
			if (this.currentIndex <= 0) {
				console.log("Already at first tag, can't go back any further!");
			} else {
				this.currentIndex -= 1;
				this.goToTagAtIndex(this.currentIndex);
			}
		});
		// this.videoPlayer = document.querySelector("#player");
		this.tagsArray = [];
		this.videoID = null;
		this.currentIndex = -1;
	}
	setCurrentVideo (ytID) {
		console.log("Now playing: " + ytID);
		this.videoID = ytID;
		// this.videoPlayer.src = `https://www.youtube.com/embed/${ytID}`;
		player.loadVideoById({'videoId': ytID});
		player.seekTo(0);
		player.pauseVideo();
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
			// this.currentIndex = 0;
		} else {
			console.log("No tags loaded!");
		}
	}
	goToTagAtIndex (index) {
		if (this.tagsArray[index]) {
			// console.log(`Jumping to tag ${this.tagsArray[index].name} at time ${this.tagsArray[index].time}`);
			this.updateTagDisplay(this.tagsArray[index]);
			this.currentIndex = index;
			// this.videoPlayer.src = `https://www.youtube.com/embed/${this.videoID}?t=${this.tagsArray[index].time}`;
			player.seekTo(this.tagsArray[index].time);
			player.playVideo();
		} else {
			console.error(`That tag doesn't exist. (Tried accessing tag at index ${index} of the tag list)`);
		}
	}
	hidePlayer () {
		document.querySelector("#currentTagDisplay").style.display = "none";
		document.querySelector("#player").style.display =  "none";
		document.querySelector("#tagDec").style.display = "none";
		document.querySelector("#tagInc").style.display = "none";
		document.querySelector("#videoPlaceholder").style.display = "inline-block";
		document.querySelector("#tagInstructionsTitle").style.display = "block";
		document.querySelector("#tagInstructions").style.display = "block";
	}
	showPlayer () {
		document.querySelector("#currentTagDisplay").style.display = "block";
		document.querySelector("#player").style.display =  "block";
		document.querySelector("#tagDec").style.display = "block";
		document.querySelector("#tagInc").style.display = "block";
		document.querySelector("#videoPlaceholder").style.display = "none";
		document.querySelector("#tagInstructionsTitle").style.display = "none";
		document.querySelector("#tagInstructions").style.display = "none";
	}
	updateTagDisplay(tag) {
		document.querySelector("#currentTagDisplay").innerHTML = `Current Tag: ${tag.name}`;	
	}
}
nirb.TaggerParser = class {
	constructor() {
		this.taggerRegex = /(?:Tags)?\n?(?:https:\/\/www\.youtube\.com\/watch\?v=(.*?))(?:\sstart\stime:\s(\d\d:\d\d:\d\d\s\w*)\s\((\d\d)\))?\n((?:.|\n)*)/gm;
		this.shortenedTaggerRegex = /(?:Tags)?\n?(?:https:\/\/youtu\.be\/(.*))(?:\sstart\stime:\s(\d\d:\d\d:\d\d\s\w*)\s\((\d\d)\))?\n((?:.|\n)*)/gm;

		this.taggerRegexArray = [];
		this.taggerRegexArray.push(this.taggerRegex);
		this.taggerRegexArray.push(this.shortenedTaggerRegex);

		//this.tagListRegex = /(.*?)(?:(\d{1,2})(?:h|:))?(?:(\d{1,2})(?:m|:))?(?:(\d{1,2})s?)(.*?)$/;
		this.tagListRegex = /(.*?)(?:(\d{1,2})(?::))?(?:(\d{1,2})(?::))?(?:(\d{1,2}))(.*?)$/;
		this.tagListRegexArray = [];
		this.tagListRegexArray.push(this.tagListRegex);
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

		//let captureArray = this.taggerRegex.exec(taggerString);
		// if (captureArray == null) {
		// 	this.regexRetry++;
		// 	if(this.regexRetry > 10) {
		// 		captureArray = this.shortenedTaggerRegex.exec(taggerString);
		// 		if(captureArray == null) {
		// 			captureArray = this.shortenedTaggerRegex.exec(taggerString);
		// 			if(captureArray == null) {
		// 				window.alert("Failed to parse tags, bad formatting?");
		// 				return;
		// 			}
		// 		}
		// 	} else {
		// 		this.parseVideoDetails(taggerString); // weird stupid fix because regex doesn't like parsing the first time around
		// 		return;
		// 	}
		// }

		let captureArray = null;

		for(let i = 0; i<this.taggerRegexArray.length;i++){
			captureArray = this.taggerRegexArray[i].exec(taggerString);
			if(captureArray != null){
				break;
			}
		}

		if(captureArray == null){

			for(let i = 0; i<this.taggerRegexArray.length;i++){
				captureArray = this.taggerRegexArray[i].exec(taggerString);
				if(captureArray != null){
					break;
				}
			}
			if(captureArray == null){
				window.alert("Failed to parse tags, bad formatting?");
				return;
			}
		}



		console.log(captureArray);
		const videoId = captureArray[1];
		nirb.YTManagerSingleton.setCurrentVideo(videoId);

		// const startTime = captureArray[2];
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
			let tagSeconds = 0;
			let tagArray = this.tagListRegex.exec(rawTagArray[i]);
			console.log("Parsed tag as: ", tagArray);
			if (tagArray == null) {
				continue;
			}
			let tagTitle = tagArray[1];
			if (tagArray[1] == "" || tagArray[1] == null) {
				tagTitle = tagArray[5];
			}
			// if (tagArray[2]) {
			// 	tagHours = parseInt(tagArray[2]); // if the tag has an hour field, set the hour field
			// }
			// if (tagArray[3]) {
			// 	tagMinutes = parseInt(tagArray[3]); // if the tag has an minute field, set the minute field
			// }
			let timeArray = [];
			for(let timeDenom = 4; timeDenom>=2; timeDenom--){
				if(tagArray[timeDenom]){
					timeArray.push(parseInt(tagArray[timeDenom]));
				}
			}
			console.log(`TIME DENOMINATION: ${timeArray}`);
			for(let timeIndex = 0; timeIndex<timeArray.length; timeIndex++){
				switch(timeIndex){
					case 0:
						tagSeconds = timeArray[timeIndex];
						break;
					case 1:
						tagMinutes = timeArray[timeIndex];
						break;
					case 2:
						tagHours = timeArray[timeIndex];
						break;
				}
			}



//			tagSeconds = parseInt(tagArray[4]);
			let tagTotalSeconds = (tagHours * 3600) + (tagMinutes * 60) + tagSeconds; //tag will always have a seconds field
			const newTag = new nirb.TSTag(tagTitle, tagTotalSeconds, tagHours, tagMinutes, tagSeconds);

			console.log(`adding tag with title "${tagTitle}" at ${tagTotalSeconds} (${tagHours}h${tagMinutes}m${tagSeconds}s)`);
			nirb.YTManagerSingleton.addTagToList(newTag);
		}
		// console.log(nirb.YTManagerSingleton.tagsArray);
		nirb.YTManagerSingleton.showPlayer();
		nirb.YTManagerSingleton.currentIndex = -1;
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
