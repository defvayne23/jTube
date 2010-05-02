/**
* jQuery Youtube API Feed Plugin
* @author John Hoover <john@defvayne23.com>
*
*/
(function($) {
	$.extend({
		jTube: function(options){
			var options = $.extend({
				author: '',
				search: '',
				feed: '',
				order: 'published',
				time: 'all_time',
				limit: 5,
				page: 1,
				success: function(videos){}
			}, options);
			var youtubeUrl = 'http://gdata.youtube.com/feeds/';
			var videoElem = this;
			var imageUrl = ''
			
			if(options.author != '')
				youtubeUrl += 'users/'+options.author+'/uploads?';
			else if(options.search != '')
				youtubeUrl += 'api/videos?q='+options.search+'&';
			else if(options.feed != '')
				youtubeUrl += 'api/standardfeeds/'+options.feed+'?';
			
			youtubeUrl += 'alt=json';
			youtubeUrl += '&max-results='+options.limit;
			youtubeUrl += '&start-index='+(((options.page * options.limit) - options.limit) + 1);
			youtubeUrl += '&orderby='+options.order;
			youtubeUrl += '&time='+options.time;
			
			$.ajax({
				url: youtubeUrl,
				dataType: 'json',
				success: function(data) {
					var videos = [];
					
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
							published: this.published.$t,
							link: this.link[0].href,
							categories: categories,
							author: {
								name: this.author[0].name.$t,
								link: this.author[0].uri.$t
							},
							videos: this.media$group.media$content,
							thumbnails: this.media$group.media$thumbnail
						};
						
						if(this.yt$statistics)
							video.views = this.yt$statistics.viewCount;
						
						videos[videos.length] = video;
					});
					
					options.success(videos);
				}
			});
			
			return this;
		}
	});
})(jQuery);