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

//this class is mostly a puppet class that adapts the methods provided by the player object
//for use with this app
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
		document.addEventListener('keydown', (event) => {
			let name = event.key;
			let code = event.code;
			if (event.key === "ArrowRight") {
				if (this.currentIndex >= this.tagsArray.length - 1) {
					console.log("Already at last tag, can't go forwards any further!");
				} else {
					this.currentIndex += 1;
					this.goToTagAtIndex(this.currentIndex);
				}
			}

			if (event.key === "ArrowLeft") {
				if (this.currentIndex <= 0) {
					console.log("Already at first tag, can't go back any further!");
				} else {
					this.currentIndex -= 1;
					this.goToTagAtIndex(this.currentIndex);
				}
			}

			if (event.key === "Escape") {
				this.hidePlayer();
				this.resetTagList();
				player.seekTo(0);
				player.pauseVideo();
				this.updateTagDisplay(new nirb.TSTag("", 0, 0, 0, 0));
			}
			if (event.key === "d") {
				console.log(this.tagsArray);
			}
			if (event.key === "x") {
				if (player.getDuration() == 0) {
					return;
				}
				console.log("exporting");
				console.log("video duration: " + player.getDuration());
				let exportArray = [];
				for (let i = 1; i < this.tagsArray.length; i++) {
					const prevTag = this.tagsArray[i - 1];
					const curTag = this.tagsArray[i];
					// need time start - time end, along with title of prev
					let clipTag = new nirb.ClipTag(prevTag.name, prevTag.time, curTag.time);
					exportArray.push(clipTag);
				}
				// do the last tag
				const lastTag = this.tagsArray[this.tagsArray.length - 1];
				let lastClipTag = new nirb.ClipTag(lastTag.name, lastTag.time, player.getDuration());
				exportArray.push(lastClipTag);
				console.log(exportArray);


				let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportArray));
				let dlAnchorElem = document.getElementById('downloadAnchorElem');
				dlAnchorElem.setAttribute("href", dataStr);
				dlAnchorElem.setAttribute("download", "data.json");
				dlAnchorElem.click();
			}
		});

		// this.videoPlayer = document.querySelector("#player");
		this.tagsArray = [];
		this.videoID = null;
		this.currentIndex = -1;
        this.loadedVideoId = "";
	}
	setCurrentVideo(ytID) {
		console.log("Now playing: " + ytID);
		this.videoID = ytID;
		// this.videoPlayer.src = `https://www.youtube.com/embed/${ytID}`;
		player.loadVideoById({
			'videoId': ytID
		});
		player.seekTo(0);
		player.pauseVideo();
	}
	resetTagList() {
		this.tagsArray = [];
	}
	addTagToList(tag) {
		this.tagsArray.push(tag)
	}
	goToTagAtIndex(index) {
		if (this.tagsArray[index]) {
			// console.log(`Jumping to tag ${this.tagsArray[index].name} at time ${this.tagsArray[index].time}`);
			this.updateTagDisplay(this.tagsArray[index]);
			this.currentIndex = index;
			// this.videoPlayer.src = `https://www.youtube.com/embed/${this.videoID}?t=${this.tagsArray[index].time}`;

            let start = this.tagsArray[index].time;
            if(start > 0){
                start = start - 1;
            }
            let end = player.getDuration();
            if(index < this.tagsArray.length-1){
                end = this.tagsArray[index+1].time;
            }
            if(start == end){
                end = end + 1;
            }
			//player.seekTo(this.tagsArray[index].time);
			//player.playVideo();

            console.log("loading: " + this.loadedVideoId)
            player.loadVideoById({'videoId': this.loadedVideoId,
               'startSeconds': start,
               'endSeconds': end});
            player.playVideo();
		} else {
			console.error(`That tag doesn't exist. (Tried accessing tag at index ${index} of the tag list)`);
		}
	}
	hidePlayer() {
		document.querySelector("#currentTagDisplay").style.display = "none";
		document.querySelector("#player").style.display = "none";
		document.querySelector("#playerInstructions").style.display = "none";
		document.querySelector("#tagDec").style.display = "none";
		document.querySelector("#tagInc").style.display = "none";
		document.querySelector("#videoPlaceholder").style.display = "inline-block";
		document.querySelector("#tagInstructionsTitle").style.display = "block";
		document.querySelector("#tagInstructions").style.display = "block";
		document.querySelector("#entryBoxInstructions").style.display = "block";
	}
	showPlayer() {
		document.querySelector("#currentTagDisplay").style.display = "block";
		document.querySelector("#player").style.display = "block";
		document.querySelector("#playerInstructions").style.display = "block";
		document.querySelector("#tagDec").style.display = "block";
		document.querySelector("#tagInc").style.display = "block";
		document.querySelector("#videoPlaceholder").style.display = "none";
		document.querySelector("#tagInstructionsTitle").style.display = "none";
		document.querySelector("#tagInstructions").style.display = "none";
		document.querySelector("#entryBoxInstructions").style.display = "none";
	}
	updateTagDisplay(tag) {
		document.querySelector("#currentTagDisplay").innerHTML = `Current Tag: ${tag.name}`;
	}
}
nirb.TaggerParser = class {
	constructor() {
		this.taggerRegex = /(?:Tags)?\n?(?:https:\/\/www\.youtube\.com\/watch\?v=(.{11}).*?)(?:\sstart\stime:\s(\d\d:\d\d:\d\d\s\w*)\s\((\d\d)\))?\n((?:.|\n)*)/gm;
		this.shortenedTaggerRegex = /(?:Tags)?\n?(?:https:\/\/youtu\.be\/(.*))(?:\sstart\stime:\s(\d\d:\d\d:\d\d\s\w*)\s\((\d\d)\))?\n((?:.|\n)*)/gm;

		this.taggerRegexArray = [];
		this.taggerRegexArray.push(this.taggerRegex);
		this.taggerRegexArray.push(this.shortenedTaggerRegex);
		this.isKorotaggerInput = false;

		this.koroTaggerTitleRegex = /(.*?)(?:(\d{1,2})(?:h|:))?(?:(\d{1,2})(?:m|:))?(?:(\d{1,2})s?)$/;
		this.tagListRegex = /(.*?)(?:(\d{1,2})(?::))?(?:(\d{1,2})(?::))?(?:(\d{1,2}))(.*?)$/;
		this.tagListRegexArray = [];
		this.tagListRegexArray.push(this.tagListRegex);
		this.numTags = 0;
		document.querySelector("#submitTaggerInput").addEventListener('click', (event) => {
			const taggerTextArea = document.querySelector("#taggerInput");
			// console.log("button pressed");
			// console.log(taggerTextArea.value);
			if (this.isKorotaggerInput) {
				this.parseVideoDetailsKorotagger(taggerTextArea.value)
				return
			}
			this.parseVideoDetails(taggerTextArea.value);
		});

		document.querySelector("#korotaggerToggle").addEventListener("change", (event) => {
			if (event.target.checked) {
				this.isKorotaggerInput = true;
			} else {
				this.isKorotaggerInput = false;
			}
		});
	}

	parseVideoDetailsKorotagger(taggerString) {
		console.log(taggerString + ", applying custom Korotagger parsing:");

		//lazy so copying this for now
		let captureArray = null;

		//attempt to parse the input
		//the reason it's an array is because there are two regexes
		//that search for both shortened and unshortened youtube video urls
		//also leaves room for expansion later with other formats like output from discord bots
		for (let i = 0; i < this.taggerRegexArray.length; i++) {
			captureArray = this.taggerRegexArray[i].exec(taggerString);
			if (captureArray != null) {
				break;
			}
		}

		//try again, sometimes it doesn't work on the first try for some reason
		if (captureArray == null) {

			for (let i = 0; i < this.taggerRegexArray.length; i++) {
				captureArray = this.taggerRegexArray[i].exec(taggerString);
				if (captureArray != null) {
					break;
				}
			}
			if (captureArray == null) {
				window.alert("Failed to parse tags, bad formatting?");
				return;
			}
		}
		console.log(captureArray);
		const videoId = captureArray[1];
		nirb.YTManagerSingleton.setCurrentVideo(videoId);
        nirb.YTManagerSingleton.loadedVideoId = videoId;
		// const startTime = captureArray[2];
		this.numTags = captureArray[3];
		const rawTagString = captureArray[4];
		this.parseTagsKorotagger(rawTagString);
	}

	parseTagsKorotagger(rawTagString) {
		const rawTagArray = rawTagString.split("\n");
		console.log("Parsing over array(Korotagger ver.):")
		console.log(rawTagArray);
		nirb.YTManagerSingleton.resetTagList();

		for (let i = 0; i < rawTagArray.length; i++) {
			// parse second
			console.log("inspecting string: " + rawTagArray[i])
			let secondRegex = /(\d{1,2})s$/;
			let secondArray = secondRegex.exec(rawTagArray[i]);
			//console.log("parsed seconds as: " + secondArray);
			let minuteSecondRegex = /(\d{1,2})m(\d{1,2})s$/;
			let minuteSecondArray = minuteSecondRegex.exec(rawTagArray[i]);
			//console.log("parsed minutes:seconds as: " + minuteSecondArray);
			let hourSecondRegex = /(\d{1,2})h(\d{1,2})s$/;
			let hourSecondArray = hourSecondRegex.exec(rawTagArray[i]);
			//console.log("parsed hours:seconds as: " + hourSecondArray);
			let hourMinuteSecondRegex = /(\d{1,2})h(\d{1,2})m(\d{1,2})s$/;
			let hourMinuteSecondArray = hourMinuteSecondRegex.exec(rawTagArray[i]);
			//console.log("parsed hours:minutes:seconds as: " + hourMinuteSecondArray);
			let hours = 0;
			let minutes = 0;
			let seconds = 0;

			if (hourMinuteSecondArray) {
				hours = hourMinuteSecondArray[1];
				minutes = hourMinuteSecondArray[2];
				seconds = hourMinuteSecondArray[3];
			}
			if (hourSecondArray) {
				hours = hourSecondArray[1];
				seconds = hourSecondArray[2];
			}
			if (minuteSecondArray) {
				minutes = minuteSecondArray[1];
				seconds = minuteSecondArray[2];
			}
			if (secondArray) {
				seconds = secondArray[1];
			}
			console.log("parsed out: " + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds!")
			let tagArray = this.tagListRegex.exec(rawTagArray[i]);
			let tagTitle = rawTagArray[i];
			let tagTotalSeconds = (hours * 3600) + (minutes * 60) + (seconds * 1); //tag will always have a seconds field
			const newTag = new nirb.TSTag(tagTitle, tagTotalSeconds, hours, minutes, seconds);
			console.log(`adding KOROtag with title "${tagTitle}" at ${tagTotalSeconds} (${hours}h${minutes}m${seconds}s)`);
			nirb.YTManagerSingleton.addTagToList(newTag);
		}

		nirb.YTManagerSingleton.showPlayer();
		nirb.YTManagerSingleton.currentIndex = -1; //start at an invalid tag index so the video doesn't start playing until the user clicks next, after which it starts at the first tag
	}

	parseVideoDetails(taggerString) {
		console.log(taggerString + ", appling regex " + this.taggerRegex);

		let captureArray = null;

		//attempt to parse the input
		//the reason it's an array is because there are two regexes
		//that search for both shortened and unshortened youtube video urls
		//also leaves room for expansion later with other formats like output from discord bots
		for (let i = 0; i < this.taggerRegexArray.length; i++) {
			captureArray = this.taggerRegexArray[i].exec(taggerString);
			if (captureArray != null) {
				break;
			}
		}

		//try again, sometimes it doesn't work on the first try for some reason
		if (captureArray == null) {

			for (let i = 0; i < this.taggerRegexArray.length; i++) {
				captureArray = this.taggerRegexArray[i].exec(taggerString);
				if (captureArray != null) {
					break;
				}
			}
			if (captureArray == null) {
				window.alert("Failed to parse tags, bad formatting?");
				return;
			}
		}



		console.log(captureArray);
		const videoId = captureArray[1];
		nirb.YTManagerSingleton.setCurrentVideo(videoId);
        nirb.YTManagerSingleton.loadedVideoId = videoId;

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
		for (let i = 0; i < rawTagArray.length; i++) {
			let tagHours = 0;
			let tagMinutes = 0;
			let tagSeconds = 0;
			let tagArray = this.tagListRegex.exec(rawTagArray[i]);
			console.log("Parsed tag as: ", tagArray);
			if (tagArray == null) {
				continue;
			}
			//regex exec array returns an array like:
			// 1     2     3       4       5
			// title hours minutes seconds titleIfBehindTimestamp
			// (index 0 is the full match)
			let tagTitle = tagArray[1];
			if (tagArray[1] == "" || tagArray[1] == null) {
				tagTitle = tagArray[5]; // if title was not found at the beginning put in the title we found at the end
			}

			//parse the time from the array returned by the regex exec
			//due to how the regex prioritizes stuff,
			//it will try to fill the fields like
			//hours->minutes->seconds.
			//So if a tag has only two time fields, like 1:45
			//, the default interpretation would be 1 HOUR and 45 MINUTES
			//instead of the (most likely) intended 1 MINUTE and 45 SECONDS
			// future brian here, hahaha korotagger messes this up, we actually want one hour 45 seconds sometimes woo
			// this should be a different thing

			//this is my solution:
			let timeArray = []; //empty array that acts as a stack
			//iterate backwards from the seconds index to the hours index
			for (let timeDenom = 4; timeDenom >= 2; timeDenom--) {
				if (tagArray[timeDenom] && (!(tagArray[timeDenom] === "0") || !(tagArray[timeDenom] === "00"))) {
					timeArray.push(parseInt(tagArray[timeDenom])); //only insert into the stack if the time isn't null(zero is an exception)
					//so we override its falsy nature
				}
			}
			//timeArray now has all the units of time in order of ascending magnitude
			//now we can just set the variables declared at the beginning of this for loop to the values in the array
			//console.log(`TIME DENOMINATION: ${timeArray}`);
			for (let timeIndex = 0; timeIndex < timeArray.length; timeIndex++) {
				switch (timeIndex) {
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

			//calculate total time in seconds because we need that to jump to that point in the video
			let tagTotalSeconds = (tagHours * 3600) + (tagMinutes * 60) + tagSeconds; //tag will always have a seconds field
			const newTag = new nirb.TSTag(tagTitle.trim(), tagTotalSeconds, tagHours, tagMinutes, tagSeconds);

			console.log(`adding tag with title "${tagTitle.trim()}" at ${tagTotalSeconds} (${tagHours}h${tagMinutes}m${tagSeconds}s)`);
			nirb.YTManagerSingleton.addTagToList(newTag);
		}
		// console.log(nirb.YTManagerSingleton.tagsArray);
		nirb.YTManagerSingleton.showPlayer();
		nirb.YTManagerSingleton.currentIndex = -1; //start at an invalid tag index so the video doesn't start playing until the user clicks next, after which it starts at the first tag
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
// data holder for export format
nirb.ClipTag = class {
	constructor(tagName, tagStartSeconds, tagEndSeconds) {
		this.tagName = tagName;
		this.tagStartSeconds = tagStartSeconds;
		this.tagEndSeconds = tagEndSeconds;
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