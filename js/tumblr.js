$(function() {
  if ($('#tumblr').length) {
    getTumblog($("#tumblr").data("tumblr"), "#tumblr");
  }

  // ------------------------------------------------------------------------
  // RETRIEVES TUMBLR DATA
  function getTumblog(username, target){

    var tumblrkey = "mhg6b9xFS5pGZr9inve9sSsa0Zl2zy4ojb3K7Ta3aWswFqqSU8";
    var tumblruser = username + ".tumblr.com";
    var endpoint = "http://api.tumblr.com/v2/blog/" + tumblruser + "/posts/";

    var data = {
      api_key: tumblrkey
    };

    setTimeout(function() {
      $.ajax({
        type: "GET",
        url: endpoint,
        dataType: "jsonp",
        data: data
      })
      .done(function(returnData) {
        processTumblog(returnData, username, target);
      });

    }, 500);
  }
  // ------------------------------------------------------------------------
  // PARSES TUMBLR DATA INTO ARRAY
  function processTumblog(data, username, target){

    var limit = parseInt($("#tumblr").data("tumblr-limit"));
    var usernamesafe = username.replace(/-/g,'');
    var html = '<div class="rssBody" id="tumblr_'+usernamesafe+'"><ul id="blog-entries"></ul></div>';

    if (data.meta.status == 200) {
        var feed = {
          url: 'http://' + username + '.tumblr.com',
          posts: []
        };

        $(data.response.posts).each(function(i, post) {

          switch (post.type){
            case "text":
              feed.posts.push({
                text: {
                  title: post.title,
                  body: post.body
                }
              });
              break;

            case "photo":
              var photos = [];
              $(post.photos).each(function(i, obj){
                photos.push({
                  photo_url: obj.alt_sizes[1].url // 500px wide
                })
              });

              feed.posts.push({
                photo: {
                  caption: post.caption,
                  photos: photos
                }
              });
              break;

            case "quote":
              feed.posts.push({
                quote: {
                  type: post.type,
                  tags: post.tags,
                  text: post.text,
                  source: post.source
                }
              });
              break;

            case "link":
              feed.posts.push({
                link: {
                  linkURL: post.url,
                  title: post.title,
                  description: post.description
                }
              });
              break;

            case "chat":
              var chat_log = post.body.split("\n");
              feed.posts.push({
                chat: {
                  title: post.title,
                  body: post.body,
                  chat: chat_log,
                  dialogue: post.dialogue
                }
              });
              break;

            case "audio":
              feed.posts.push({
                audio: {
                  source_title: post.source_title,
                  source_url: post.source_url,
                  id3_title: post.id3_title,
                  caption: post.caption,
                  audio_player: post.player,
                  audio_plays: post.plays,
                  artist: post.artist,
                  album: post.album,
                  track_name: post.track_name,
                  track_num: post.track_num,
                  year: post.year
                }
              });
              break;

            case "video":
              feed.posts.push({
                video: {
                  source_title: post.source_title,
                  caption: post.caption,
                  video_embed: post.player[2].embed_code
                }
              });
              break;

            case "answer":
              feed.posts.push({
                answer: {
                  asking_name: post.asking_name,
                  asking_url: post.asking_url,
                  question: post.question,
                  answer: post.answer
                }
              });
              break;


            default:
              feed.posts.push({
                title: post.title,
                body: post.body
              });
          } // end switch

          feed.posts[feed.posts.length - 1].date = post.date.substr(0,10);
          feed.posts[feed.posts.length - 1].tags = post.tags;
          feed.posts[feed.posts.length - 1].timestamp = post.timestamp;
          feed.posts[feed.posts.length - 1].url = post.post_url;
          feed.posts[feed.posts.length - 1].type = post.type;
          feed.posts[feed.posts.length - 1].note_count = post.note_count;

        }); // end each

       if (limit > 0) {
         feed.posts = feed.posts.slice(0, limit);
       }
       $("#tumblr").html(createTumblrHTML(feed, username));
       $(window).trigger("tumblr:loaded");

    } // end if
  } // end function
  // ------------------------------------------------------------------------
  // PARSES DATA FEED INTO STANDARD HTML
  function createTumblrHTML(data, username){

    var thehtml ="";

    $(data.posts).each(function(i, post) {

      switch (post.type){
        case "text":
           thehtml +='<div class="entry text">';
           thehtml +='   <h2><a href="'+post.url+'">'+post.text.title+'</a></h2>';
           thehtml +=     post.text.body;
           thehtml +='   <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
           if (post.tags.length >0){  thehtml += createTumblrTags(post.tags);  }
           thehtml +=' </div>';
          break;

        case "photo":

           thehtml +='<div class="entry photo">';
           thehtml += '   <div class="photos">';
           $(post.photo.photos).each(function(j, thephoto){
            thehtml += ' <img src="'+thephoto.photo_url+'" />';
           });
           thehtml += '  </div>';
           thehtml +=    post.photo.caption;
           thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
           if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);   }
           thehtml += '</div>';
          break;


        case "quote":
           thehtml +='<div class="entry quote">';
           thehtml +='   <h2>'+post.quote.text+'</h2>';
           thehtml +='   <p class="source">'+post.quote.source+'</p>';
           thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
          if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);  }
           thehtml +=' </div>';
          break;

        case "link":
          thehtml +='<div class="entry link">';
          thehtml +='    <h2><a href="'+post.link.linkURL+'">'+post.link.title+'</a></h2>';
          thehtml +=    post.link.description;
          thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
          if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);  }
          thehtml +='</div>';
          break;

        case "chat":
          thehtml +=' <div class="entry chat">';
          thehtml +='    <h2><a href="'+post.url+'">'+post.chat.title+'</a></h2>';
          thehtml +='    <ul>';
          $(post.chat.chat).each(function(k, chatter){
          thehtml +='        <li>'+chatter+'</li>';
          });
          thehtml +='    </ul>';
          thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
          if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);  }
          thehtml +='  </div>';
          break;

        case "audio":
          thehtml +=' <div class="entry audio">';
          thehtml +='    <div class="player">'+post.audio.audio_player+'</div>';
          thehtml +=      post.audio.caption;
          thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
          if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);  }
          thehtml +='  </div>';
          break;

        case "video":
          thehtml +=' <div class="entry video">';
          thehtml +='    <div class="thevideo">'+post.video.video_embed+'</div>';
          thehtml +=      post.video.caption;
          thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
          if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);  }
          thehtml +='  </div>';
          break;

        case "answer":
          thehtml += ' <div class="entry answer">';
          thehtml += '    <div class="query"><h3>'+post.answer.question+'<h3>';
          thehtml += '    &mdash; '+post.answer.asking_name+'</div>';
          thehtml += '    <div class="response"><p>'+post.answer.answer+'</p></div>';
          thehtml += '  <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
          if (post.tags != null){  thehtml += createTumblrTags(post.tags,username);  }
          thehtml += '  </div>';
          break;

        default:
          thehtml +='<div class="entry text">';
           thehtml +='   <h2><a href="'+post.url+'">'+post.title+'</a></h2>';
           thehtml +=     post.body;
           thehtml +='   <div class="timestamp"><a href="'+post.url+'"><i class="icon-time"></i> Posted '+post.date+' <i class="icon-heart"></i> '+post.note_count+'</a></div>';
           if (post.tags.length >0){  thehtml += createTumblrTags(post.tags,username);   }
           thehtml +=' </div>';
      } // end switch
    });// end each

    thehtml += '<a class="readmore button" href="http://'+username+'.tumblr.com/page/2" target="_blank">Read More</a>';
    return thehtml;

  } // end createTumblrHTML

  function createTumblrArchive(posts,username){

  }
  // helper function to make linked tags
  function createTumblrTags(tags,tumblrUsername){
    var returnhtml = "<div class='tags'>";
    for (var i=0;i<=tags.length-1;i++){
      returnhtml += "<a href='http://"+tumblrUsername+".tumblr.com/tagged/"+tags[i]+"'>#"+tags[i]+"</a>";
    }
    returnhtml += "</div>";
    return returnhtml;
  }
});