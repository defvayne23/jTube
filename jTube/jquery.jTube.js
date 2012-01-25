/*
 * jTube
 * http://jtube.monkeecreate.com
 * 
 * jQuery Youtube API Feed Plugin
 * 
 * Developed by John Hoover <john@defvayne23.com>
 * Another project from monkeeCreate <http://monkeecreate.com>
 *
 * Version 2.0.0 - Last updated: September 11, 2010
*/
(function($) {
	$.extend({
		jTube: function(options){
			var options = $.extend({
				request: '',
				requestValue: '',
				requestOption: '',
				format: 'flash',
				order: '',
				time: 'all_time',
				limit: 5,
				page: 1,
				success: function(videos, pages){},
				error: function(message){}
			}, options);
			var youtubeUrl = 'http://gdata.youtube.com/feeds/api/';
			var videoElem = this;
			var imageUrl = '';
			var date = new Date();
			
			if(options.order == '') {
				if(options.request == 'user' && options.requestOption == 'playlists') {
					options.order = 'position';
				} else if(options.request == 'search') {
					options.order = 'relevance';
				} else {
					options.order = 'published';
				}
			}
			
			function parseISO8601(string) {
				var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
					"(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
					"(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
				var d = string.match(new RegExp(regexp));
				
				var offset = 0;
				var date = new Date(d[1], 0, 1);
				
				if (d[3]) { date.setMonth(d[3] - 1); }
				if (d[5]) { date.setDate(d[5]); }
				if (d[7]) { date.setHours(d[7]); }
				if (d[8]) { date.setMinutes(d[8]); }
				if (d[10]) { date.setSeconds(d[10]); }
				if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
				if (d[14]) {
					offset = (Number(d[16]) * 60) + Number(d[17]);
					offset *= ((d[15] == '-') ? 1 : -1);
				}
				
				offset -= date.getTimezoneOffset();
				time = (Number(date) + (offset * 60 * 1000));
				return new Date(Number(time));
			}
			
			if(options.request == 'user') {
				if(options.requestOption == "profile") {
					youtubeUrl += 'users/'+options.requestValue+'?';
				} else {
					if(options.requestOption == '') {
						options.error("Request option for 'users' was not passed.");
					} else {
						youtubeUrl += 'users/'+options.requestValue+'/'+options.requestOption+'?';
					}
				}
			} else if(options.request == 'search') {
				youtubeUrl += 'videos?q='+options.requestValue+'&';
			} else if(options.request == 'feed') {
				if(options.requestOption == '') {
					youtubeUrl += 'standardfeeds/'+options.requestValue+'?';
				} else {
					youtubeUrl += 'standardfeeds/'+options.requestOption+'/'+options.requestValue+'?';
				}
			} else if(options.request == 'playlist') {
				youtubeUrl += 'playlists/'+options.requestValue+'?';
			} else if(options.request == 'video') {
				if(options.requestOption == "info") {
					youtubeUrl += 'videos/'+options.requestValue+'?';
				} else {
					if(options.requestOption == '') {
						options.error("Request option for 'videos' was not passed.");
					} else {
						youtubeUrl += 'videos/'+options.requestValue+'/'+options.requestOption+'?';
					}
				}
			} else {
				options.error('No feed choices given.');
				return false;
			}
			
			youtubeUrl += 'alt=json-in-script&v=2';
			
			if((options.request == 'user' && options.requestOption == "profile")
				|| (options.request == 'videos' && options.requestOption == "info")
			) {
				// Skip setting options
			} else {
				if(options.request == 'video' && (options.requestOption == 'info')) {
					
				} else {
					youtubeUrl += '&max-results='+options.limit;
					youtubeUrl += '&start-index='+(((options.page * options.limit) - options.limit) + 1);
					youtubeUrl += '&orderby='+options.order;
				}
				
				if(options.request == 'feed' && (options.requestValue == 'most_recent' || options.requestValue == 'recently_featured' || options.requestValue == 'watch_on_mobile')) {
					// Skip setting time
				} else {
					youtubeUrl += '&time='+options.time;
				}
				
				if(options.format == "mpeg") {
					youtubeUrl += '&format=6';
				} else if(options.format == "h263") {
					youtubeUrl += '&format=1';
				} else {
					youtubeUrl += '&format=5';
				}
			}
			
			youtubeUrl +='&callback=?';
			
			$.getJSON(
				youtubeUrl,
				function(data) {
					if(data != '' && data != null) {
						if(options.request == 'user' && options.requestOption == 'playlists') {
							var playlists = [];
							
							$(data.feed.entry).each(function(){
								var playlist = {
									id: this.yt$playlistId.$t,
									title: this.title.$t,
									summary: this.summary.$t,
									link: this.link[1].href,
									hits: this.yt$countHint.$t,
									published: parseISO8601(this.published.$t),
									updated: parseISO8601(this.updated.$t)
								};
				
								playlists[playlists.length] = playlist;
							});
							
							var return_data = playlists;
							
							if(data.feed) {
								var pages = Math.ceil(data.feed.openSearch$totalResults.$t / options.limit);
							} else {
								var pages = 0;
							}
						} else if(options.request == 'user' && options.requestOption == 'subscriptions') {
							var subscriptions = [];
							
							$(data.feed.entry).each(function(){
								var subscription = {
									title: this.title.$t,
									username: this.yt$username.$t,
									link: this.link[1].href,
									published: parseISO8601(this.published.$t),
									updated: parseISO8601(this.updated.$t)
								};
								
								subscriptions[subscriptions.length] = subscription;
							});
							
							var return_data = subscriptions;
							
							if(data.feed) {
								var pages = Math.ceil(data.feed.openSearch$totalResults.$t / options.limit);
							} else {
								var pages = 0;
							}
						} else if(options.request == 'user' && options.requestOption == 'contacts') {
							var contacts = [];
							
							$(data.feed.entry).each(function(){
								var contact = {
									username: this.yt$username.$t,
									status: this.yt$status.$t,
									link: this.link[1].href,
									published: parseISO8601(this.published.$t),
									updated: parseISO8601(this.updated.$t)
								};
								
								contacts[contacts.length] = contact;
							});
							
							var return_data = contacts;
							
							if(data.feed) {
								var pages = Math.ceil(data.feed.openSearch$totalResults.$t / options.limit);
							} else {
								var pages = 0;
							}
						} else if(options.request == 'user' && options.requestOption == 'profile') {
							var return_data = {
								username: data.entry.yt$username.$t,
								thumbnail: data.entry.media$thumbnail.url,
								views: data.entry.yt$statistics.viewCount,
								uploadViews: data.entry.yt$statistics.videoWatchCount,
								subscribers: data.entry.yt$statistics.subscriberCount,
								lastLogin: parseISO8601(data.entry.yt$statistics.lastWebAccess),
								location: data.entry.yt$location.$t,
								age: data.entry.yt$age.$t,
								link: data.entry.link[1].href,
								title: data.entry.title.$t,
								published: parseISO8601(data.entry.published.$t),
								updated: parseISO8601(data.entry.updated.$t)
							};
							
							if(data.entry.yt$aboutMe.$t) {
								return_data.about = data.entry.yt$aboutMe.$t;
							}
							
							if(data.entry.yt$gender) {
								return_data.gender = data.entry.yt$gender.$t;
							}
							
							var pages = 0;
						} else if(options.request == 'video' && options.requestOption == 'comments') {
							var comments = [];
							
							$(data.feed.entry).each(function(){
								var comment = {
									author: this.author[0].name.$t,
									comment: this.content.$t,
									published: parseISO8601(this.published.$t),
									updated: parseISO8601(this.updated.$t)
								};
								
								comments[comments.length] = comment;
							});
							
							var return_data = comments;
							
							if(data.feed) {
								var pages = Math.ceil(data.feed.openSearch$totalResults.$t / options.limit);
							} else {
								var pages = 0;
							}
						} else {
							var videos = [];
							
							if(options.request == 'video' && options.requestOption == 'info') {
								entry = data.entry;
							} else {
								entry = data.feed.entry;
							}
							
							$(entry).each(function(){
								var video = {
									id: this.media$group.yt$videoid.$t,
									title: this.media$group.media$title.$t,
									description: this.media$group.media$description.$t,
									category: this.media$group.media$category[0].label,
									keywords: this.media$group.media$keywords.$t,
									link: this.link[0].href,
									author: {
										name: this.author[0].name.$t,
										link: this.author[0].uri.$t
									}
								};
								
								if(this.media$group.yt$aspectRatio) {
									video.aspect = this.media$group.yt$aspectRatio.$t;
								}
								
								if(this.yt$statistics) {
									video.views = this.yt$statistics.viewCount;
									video.favorites = this.yt$statistics.favoriteCount;
								}
								
								if(this.gd$comments) {
									video.comments = this.gd$comments.gd$feedLink.countHint;
								}
								
								if(this.gd$rating) {
									video.rating = this.gd$rating.average;
									video.raters = this.gd$rating.numRaters;
								}
								
								if(this.yt$rating) {
									video.likes = this.yt$rating.numLikes;
									video.dislikes = this.yt$rating.numDisLikes;
								}
								
								// Video Thumbnail
								if(this.media$group.media$thumbnail) {
									video.thumbnail = this.media$group.media$thumbnail[3].url;
								}
				
								// Create array of available formats
								videoFormats = [];
								$(this.media$group.media$content).each(function(){
									videoFormats[this.yt$format] = this.url;
								});
				
								// Get video url based on requested video type
								if(options.format == "mpeg") {
									video.video = videoFormats[6];
								} else if(options.format == "h263") {
									video.video = videoFormats[1];
								} else {
									video.video = videoFormats[5];
								}
				
								// Video published date/time
								if(this.published) {
									video.published = parseISO8601(this.published.$t);
								}
				
								// Video updated date/time
								if(this.published) {
									video.updated = parseISO8601(this.updated.$t);
								}
				
								// Video formated duration
								if(this.media$group.yt$duration) {
									duration = this.media$group.yt$duration.seconds;
									hours = 0;
									minutes = 0;
									seconds = 0;
				
									// Hours
									while(duration >= 3600) {
										hours = hours + 1;
										duration = duration - 3600;
									}
				
									// Minutes
									while(duration >= 60) {
										minutes = minutes + 1;
										duration = duration - 60;
									}
				
									// Seconds is remainder
									seconds = duration;
				
									// Add leading 0
									if(seconds < 10) {
										seconds = '0'+seconds;
									}
				
									// Put minutes and seconds together
									video.length = minutes+':'+seconds;
				
									// If video is an hour or more, add to video length
									if(hours > 0) {
										video.length = hours+':'+video.length;
									}
								}
				
								// Add video to array to pass back
								videos[videos.length] = video;
							});
							
							if(options.request == 'video' && options.requestOption == 'info') {
								return_data = videos[0];
								var pages = 0;
							} else {
								return_data = videos;
								
								if(data.feed.openSearch$totalResults) {
									var pages = Math.ceil(data.feed.openSearch$totalResults.$t / options.limit);
								} else {
									var pages = 0;
								}
							}
						}
						
						options.success(return_data, pages);
					} else {
						options.error("Bad request.");
					}
				}
			);
			
			return this;
		},
		jTubeEmbed: function(video, options) {
			var options = $.extend({
				// Embed Options
				width: 560,
				height: 340,
				
				// Player Options
				autoplay: false,
				fullscreen: false,
				related: true,
				loop: false,
				keyboard: true,
				genie: false,
				border: false,
				highdef: true,
				start: 0
			}, options);
			
			var videoUrl = video+"&";
			videoUrl += 'autoplay='+(options.autoplay?1:0);
			videoUrl += '&fs='+(options.fullscreen?1:0);
			videoUrl += '&rl=1'+(options.related?1:0);
			videoUrl += '&loop=1'+(options.loop?1:0);
			videoUrl += '&disablekb=0'+(options.keyboard?0:1);
			videoUrl += '&egm=1'+(options.genie?1:0);
			videoUrl += '&border=1'+(options.border?1:0);
			videoUrl += '&hd=1'+(options.highdef?1:0);
			videoUrl += '&start='+options.start;
			
			var videoEmbed = '<object width="'+options.width+'" height="'+options.height+'">';
			videoEmbed += '<param name="movie" value="'+videoUrl+'"</param>';
			videoEmbed += '<param name="allowScriptAccess" value="always"></param>';
			
			if(options.fullscreen == true) {
				videoEmbed += '<param name="allowFullScreen" value="true"></param>';
			}
			
			videoEmbed += '<embed src="'+videoUrl+'"';
			videoEmbed += '    type="application/x-shockwave-flash"';
			
			if(options.fullscreen == true) {
				videoEmbed += '    allowfullscreen="true"';
			}
			
			videoEmbed += '    allowscriptaccess="always"';
			videoEmbed += '    width="'+options.width+'" height="'+options.height+'">';
			videoEmbed += '    </embed>';
			videoEmbed += '</object>';
			
			return videoEmbed;
		}
	});
})(jQuery);