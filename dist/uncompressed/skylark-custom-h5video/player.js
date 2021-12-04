define([
  "skylark-langx",
  "skylark-domx-styler",
  "skylark-domx-noder",
  "skylark-domx-eventer",
  "skylark-domx-query",
  "skylark-domx-plugins-base"
],function(langx,styler,noder, eventer,$ , plugins) {

  'use strict'

  var CustomHtml5Video = plugins.Plugin.inherit({
    klassName : "CustomHtml5Video",

    pluginName : "intg.custom_html5_video",
   
    options : {
      selectors : {
        video : 'video',
        videoControls : '.video-controls',
        playButton : '.play',
        playbackIcons : '.playback-icons use',
        timeElapsed : '.time-elapsed',
        duration : '.duration',
        progressBar : '.progress-bar',
        seek : '.seek',
        seekTooltip : '.seek-tooltip',
        volumeButton : '.volume-button',
        volumeIcons : '.volume-button use',
        volumeMute : 'use[href="#volume-mute"]',
        volumeLow : 'use[href="#volume-low"]',
        volumeHigh : 'use[href="#volume-high"]',
        volume : '.volume',
        playbackAnimation : '.playback-animation',
        fullscreenButton : '.fullscreen-button',
        fullscreenIcons : '.fullscreen-button use',
        pipButton : '.pip-button'

      }
    },


    _construct: function(elm, options) {
      //this.options = options
      plugins.Plugin.prototype._construct.call(this,elm,options);

      let $el = this.$(),
          selectors = this.options.selectors;

      this._video = $el.find(selectors.video)[0];
      this._videoControls = $el.find(selectors.videoControls)[0];
      this._playButton = $el.find(selectors.playButton)[0];
      this._playbackIcons = $el.find(selectors.playbackIcons)[0];
      this._timeElapsed = $el.find(selectors.timeElapsed)[0];
      this._duration = $el.find(selectors.duration)[0];
      this._progressBar = $el.find(selectors.progressBar)[0];
      this._seek = $el.find(selectors.seek)[0];
      this._seekTooltip = $el.find(selectors.seekTooltip)[0];
      this._volumeButton = $el.find(selectors.volumeButton)[0];
      this._volumeIcons = $el.find(selectors.volumeIcons);
      this._volumeMute = $el.find(selectors.volumeMute)[0];
      this._volumeLow = $el.find(selectors.volumeLow)[0];
      this._volumeHigh = $el.find(selectors.volumeHigh)[0];
      this._volume = $el.find(selectors.volume)[0];
      this._playbackAnimation = $el.find(selectors.playbackAnimation)[0];
      this._fullscreenButton = $el.find(selectors.fullscreenButton)[0];
      this._fullscreenIcons = $el.find(selectors.fullscreenIcons);
      this._pipButton = $el.find(selectors.pipButton)[0];

      // Add eventlisteners here
      this.listenTo($(this._playButton),'click', this.togglePlay);
      this.listenTo($(this._video),'play',this.updatePlayButton);
      this.listenTo($(this._video),'pause',this.updatePlayButton);
      this.listenTo($(this._video),'loadedmetadata',this.initializeVideo);
      this.listenTo($(this._video),'timeupdate',this.updateTimeElapsed);
      this.listenTo($(this._video),'timeupdate',this.updateProgress);
      this.listenTo($(this._video),'volumechange',this.updateVolumeIcon);
      this.listenTo($(this._video),'click',this.togglePlay);
      this.listenTo($(this._video),'click',this.animatePlayback);
      this.listenTo($(this._video),'mouseenter',this.showControls);
      this.listenTo($(this._video),'mouseleave',this.hideControls);
      this.listenTo($(this._videoControls),'mouseenter',this.showControls);
      this.listenTo($(this._videoControls),'mouseleave',this.hideControls);
      this.listenTo($(this._seek),'mousemove',this.updateSeekTooltip);
      this.listenTo($(this._seek),'input',this.skipAhead);
      this.listenTo($(this._volume),'input',this.updateVolume);
      this.listenTo($(this._volumeButton),'click',this.toggleMute);
      this.listenTo($(this._fullscreenButton),'click',this.toggleFullScreen);
      this.listenTo($el,'fullscreenchange',this.updateFullscreenButton);
      this.listenTo($(this._pipButton),'click',this.togglePip);

      if (!('pictureInPictureEnabled' in document)) {
          this._pipButton.classList.add('hidden');
      }

      this.listenTo($(document),'keyup',this.keyboardShortcuts);
      
      const videoWorks = !!document.createElement('video').canPlayType;
      if (videoWorks) {
        this._video.controls = false;
        this._videoControls.classList.remove('hidden');
      }

      this.load();
    },


    source : function(media) {
      this._media = media;
      let title = media.title || "",
          url = media.href,
          type = media.type,
          posterUrl = media.poster || "",
          altText = media.altText || "";

      let $el = this.$(),
          video = this._video,
          $play = this._$play,
          $poster = this._$poster;

      $el.prop("title", title);
      
      if (video.canPlayType) {
        if (url && type && video.canPlayType(type)) {
          video.src = url
        }    
      }

      video.poster = posterUrl
      
      $poster.prop({
        "src" : posterUrl,
        "alt" : altText
      });

      $play.prop({
        'download' :  title,
        "href" : url
      });
    
    },

    load : function() {
      this._video.load();
    },

    play : function() {
      this._video.play();

    },

    stop : function() {

    },

    pause : function() {
      this._video.pause();      
    },

    // togglePlay toggles the playback state of the video.
    // If the video playback is paused or ended, the video is played
    // otherwise, the video is paused
    togglePlay : function () {
      if (this._video.paused || this._video.ended) {
        this._video.play();
      } else {
        this._video.pause();
      }
    },

    // updatePlayButton updates the playback icon and tooltip
    // depending on the playback state
    updatePlayButton : function () {
      this._playbackIcons.forEach((icon) => icon.classList.toggle('hidden'));

      if (video.paused) {
        this._playButton.setAttribute('data-title', 'Play (k)');
      } else {
        this._playButton.setAttribute('data-title', 'Pause (k)');
      }
    },

    // formatTime takes a time length in seconds and returns the time in
    // minutes and seconds
    formatTime : function (timeInSeconds) {
      const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

      return {
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2),
      };
    },

    // initializeVideo sets the video duration, and maximum value of the
    // progressBar
    initializeVideo : function () {
      const videoDuration = Math.round(this._video.duration);
      this._seek.setAttribute('max', videoDuration);
      this._progressBar.setAttribute('max', videoDuration);
      const time = this.formatTime(videoDuration);
      this._duration.innerText = `${time.minutes}:${time.seconds}`;
      this._duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    },

    // updateTimeElapsed indicates how far through the video
    // the current playback is by updating the timeElapsed element
    updateTimeElapsed : function () {
      const time = this.formatTime(Math.round(this._video.currentTime));
      this._timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
      this._timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`);
    },

    // updateProgress indicates how far through the video
    // the current playback is by updating the progress bar
    updateProgress : function () {
      this._seek.value = Math.floor(this._video.currentTime);
      this._progressBar.value = Math.floor(this._video.currentTime);
    },

    // updateSeekTooltip uses the position of the mouse on the progress bar to
    // roughly work out what point in the video the user will skip to if
    // the progress bar is clicked at that point
    updateSeekTooltip : function (event) {
      const skipTo = Math.round(
        (event.offsetX / event.target.clientWidth) *
          parseInt(event.target.getAttribute('max'), 10)
      );
      this._seek.setAttribute('data-seek', skipTo);
      const t = this.formatTime(skipTo);
      this._seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
      const rect = this._video.getBoundingClientRect();
      this._seekTooltip.style.left = `${event.pageX - rect.left}px`;
    },

    // skipAhead jumps to a different point in the video when the progress bar
    // is clicked
    skipAhead : function (event) {
      const skipTo = event.target.dataset.seek
        ? event.target.dataset.seek
        : event.target.value;
      this._video.currentTime = skipTo;
      this._progressBar.value = skipTo;
      this._seek.value = skipTo;
    },

    // updateVolume updates the video's volume
    // and disables the muted state if active
    updateVolume : function () {
      if (this._video.muted) {
        this._video.muted = false;
      }

      this._video.volume = this._volume.value;
    },

    // updateVolumeIcon updates the volume icon so that it correctly reflects
    // the volume of the video
    updateVolumeIcon : function () {
      this._volumeIcons.forEach((icon) => {
        icon.classList.add('hidden');
      });

      this._volumeButton.setAttribute('data-title', 'Mute (m)');

      if (this._video.muted || this._video.volume === 0) {
        this._volumeMute.classList.remove('hidden');
        this._volumeButton.setAttribute('data-title', 'Unmute (m)');
      } else if (this._video.volume > 0 && this._video.volume <= 0.5) {
        this._volumeLow.classList.remove('hidden');
      } else {
        this._volumeHigh.classList.remove('hidden');
      }
    },

    // toggleMute mutes or unmutes the video when executed
    // When the video is unmuted, the volume is returned to the value
    // it was set to before the video was muted
    toggleMute : function () {
      this._video.muted = !video.muted;

      if (this._video.muted) {
        this._volume.setAttribute('data-volume', this._volume.value);
        this._volume.value = 0;
      } else {
        this._volume.value = this._volume.dataset.volume;
      }
    },

    // animatePlayback displays an animation when
    // the video is played or paused
    animatePlayback : function () {
      this._playbackAnimation.animate(
        [
          {
            opacity: 1,
            transform: 'scale(1)',
          },
          {
            opacity: 0,
            transform: 'scale(1.3)',
          },
        ],
        {
          duration: 500,
        }
      );
    },

    // toggleFullScreen toggles the full screen state of the video
    // If the browser is currently in fullscreen mode,
    // then it should exit and vice versa.
    toggleFullScreen : function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        // Need this to support Safari
        document.webkitExitFullscreen();
      } else if (this._elm.webkitRequestFullscreen) {
        // Need this to support Safari
        this._elm.webkitRequestFullscreen();
      } else {
        this._elm.requestFullscreen();
      }
    },

    // updateFullscreenButton changes the icon of the full screen button
    // and tooltip to reflect the current full screen state of the video
    updateFullscreenButton : function () {
      fullscreenIcons.forEach((icon) => icon.classList.toggle('hidden'));

      if (document.fullscreenElement) {
        fullscreenButton.setAttribute('data-title', 'Exit full screen (f)');
      } else {
        fullscreenButton.setAttribute('data-title', 'Full screen (f)');
      }
    },

    // togglePip toggles Picture-in-Picture mode on the video
    togglePip : function () {
      try {
        if (this._video !== document.pictureInPictureElement) {
          this._pipButton.disabled = true;
          this._video.requestPictureInPicture();
        } else {
          document.exitPictureInPicture();
        }
      } catch (error) {
        console.error(error);
      } finally {
        this._pipButton.disabled = false;
      }
    },

    // hideControls hides the video controls when not in use
    // if the video is paused, the controls must remain visible
    hideControls : function () {
      if (this._video.paused) {
        return;
      }

      styler.addClass(this._video,'hide');
    },

    // showControls displays the video controls
    showControls : function () {
      styler.removeClass(this._video,'hide');
    },

    // keyboardShortcuts executes the relevant functions for
    // each supported shortcut key
    keyboardShortcuts : function (event) {
      const { key } = event;
      switch (key) {
        case 'k':
          this.togglePlay();
          this.animatePlayback();
          if (this._video.paused) {
            this.showControls();
          } else {
            setTimeout(() => {
              this.hideControls();
            }, 2000);
          }
          break;
        case 'm':
          this.toggleMute();
          break;
        case 'f':
          this.toggleFullScreen();
          break;
        case 'p':
          this.togglePip();
          break;
      }
    }    


  });

  plugins.register(CustomHtml5Video);

  return CustomHtml5Video;
});

