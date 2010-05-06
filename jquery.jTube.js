/**
* jQuery Youtube API Feed Plugin
* @author John Hoover <john@defvayne23.com>
*
*/
(function($) {
	$.extend({
		jTube: function(options){
			var options = $.extend({
				user: '',
				userType: 'uploads',
				search: '',
				feed: '',
				playlist: '',
				format: 'flash',
				order: 'published',
				time: 'all_time',
				limit: 5,
				page: 1,
				success: function(videos, pages){},
				error: function(message){}
			}, options);
			var youtubeUrl = 'http://gdata.youtube.com/feeds/';
			var videoElem = this;
			var imageUrl = ''
			
			if(options.user != '')
				youtubeUrl += 'users/'+options.user+'/'+options.userType+'?';
			else if(options.search != '')
				youtubeUrl += 'api/videos?q='+options.search+'&';
			else if(options.feed != '')
				youtubeUrl += 'api/standardfeeds/'+options.feed+'?';
			else if (options.playlist != '')
				youtubeUrl += 'api/playlists/'+options.playlist+'?';
			else {
				options.error("No feed choices given.");
				return false;
			}
			
			youtubeUrl += 'alt=json';
			youtubeUrl += '&max-results='+options.limit;
			youtubeUrl += '&start-index='+(((options.page * options.limit) - options.limit) + 1);
			youtubeUrl += '&orderby='+options.order;
			youtubeUrl += '&time='+options.time;
			
			if(options.format == "mpeg")
				youtubeUrl += '&format=6';
			else if(options.format == "h263")
				youtubeUrl += '&format=1';
			else
				youtubeUrl += '&format=5';
			
			$.ajax({
				url: youtubeUrl,
				dataType: 'json',
				success: function(data) {
					var videos = [];
					
					if(data != null) {
						$(data.feed.entry).each(function(){
							videoId = $(this.id.$t.split('/'));
							videoId = videoId[videoId.length - 1];
							
							//Create a clean category array
							var categories = [];
							$(this.category).each(function(index){
								if(index != 0) {
									categories[index - 1] = this.term
								}
							});
							
							var video = {
								title: this.title.$t,
								description: this.media$group.media$description.$t,
								link: this.link[0].href,
								categories: categories,
								author: {
									name: this.author[0].name.$t,
									link: this.author[0].uri.$t
								},
								thumbnail: this.media$group.media$thumbnail[3].url
							};
							
							videoFormats = [];
							$(this.media$group.media$content).each(function(){
								videoFormats[this.yt$format] = this.url;
							});
							
							if(options.format == "mpeg")
								video.video = videoFormats[6];
							else if(options.format == "h263")
								video.video = videoFormats[1];
							else
								video.video = videoFormats[5];
							
							if(this.published) {
								published =  this.published.$t.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/);
								
								meridiem = "pm";
								hour = published[4];
								if(hour < 12) {
									meridiem = "am";
								} else {
									if(hour > 12)
										hour = hour - 12;
								}
								
								video.published = {
									year: published[1],
									month: published[2],
									day: published[3],
									hour: hour,
									minute: published[5],
									seconds: published[6],
									meridiem: meridiem
								}
							}
							
							if(this.media$group.yt$duration.seconds) {
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
								if(seconds < 10)
									seconds = '0'+seconds;
								
								// Put minutes and seconds together
								video.length = minutes+':'+seconds;
								
								// If video is an hour or more, add to video length
								if(hours > 0)
									video.length = hours+':'+video.length;
							}
							
							if(this.yt$statistics)
								video.views = this.yt$statistics.viewCount;
							
							videos[videos.length] = video;
						});
						
						pages = Math.ceil(data.feed.openSearch$totalResults.$t / options.limit);
						
						options.success(videos, pages);
					} else {
						options.error("Bad request.");
					}
				}
			});
			
			return this;
		},
		jTubeEmbed: function(video, options) {
			var options = $.extend({
				// Embed Options
				width: 290,
				height: 250,
				
				// Player Options
				autoplay: true,
				fullscreeen: false,
				related: true,
				loop: false,
				keyboard: true,
				genie: false,
				border: false,
				highdef: true,
				start: 0
			}, options);
			
			var videoUrl = video+"?";
			videoUrl += 'autoplay='+(options.autoPlay?1:0);
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
			
			if(options.fullscreen == true)
				videoEmbed += '<param name="allowFullScreen" value="true"></param>';
			
			videoEmbed += '<embed src="'+videoUrl+'"';
			videoEmbed += '    type="application/x-shockwave-flash"';
			
			if(options.fullscreen == true)
				videoEmbed += '    allowfullscreen="true"';
			
			videoEmbed += '    allowscriptaccess="always"';
			videoEmbed += '    width="'+options.width+'" height="'+options.height+'">';
			videoEmbed += '    </embed>';
			videoEmbed += '</object>';
			
			return videoEmbed;
		}
	});
})(jQuery);