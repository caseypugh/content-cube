
var CUBE = {
  sides: ['front', 'bottom', 'back', 'top'],
  cur_side: 0,
  posts: [],
  cur_post: 0,
  deg: 0,

  init: function() {
    $(window).on('resize', CUBE.resize.bind(this)).trigger('resize');
    $(window).on('click', CUBE.next.bind(this));
    $(window).on('tumblr:loaded', this.load.bind(this))

    $('#cube').css({
      rotateY: '15deg'
    });

  },

  load: function() {
    this.cur_post = -1;

    $('#tumblr .entry').each(function(i, el) {
      CUBE.posts.push($(el).html());
    });

    $('#tumblr').hide();

    for (var i = 0; i < this.posts.length; i++) {
      $('#content_' + this.sides[this.cur_side + i] + ' .innards').html();
    }

    this.next();
  },

  resize: function() {
    var height = $('#content_' + this.sides[this.cur_side] + ' .innards').outerHeight();

    $('.content').animate({
      height: height,
      width: 580
    }, {
      duration: 500,
      ease: 'easeOut',
      progress: function() {
        $('#cube').height($('.content').height())

        for (var i = 0; i < CUBE.sides.length; i++) {
          $('#content_' + CUBE.sides[i]).css({
            transform: 'rotateX(-' + (i * 90) + 'deg) translateZ(' + (Math.round($('.content').height() / 2) + 'px') + ')'
          })
        }
      }
    });

    for (var i = 0; i < this.sides.length; i++) {
      $('#content_' + this.sides[i]).css({
        transform: 'rotateX(-' + (i * 90) + 'deg) translateZ(' + (Math.round($('.content').height() / 2) + 'px') + ')'
      })
    }
  },

  next: function() {
    this.deg += 90;
    this.cur_side += 1;
    this.cur_post += 1;

    if (this.cur_side >= this.sides.length) {
      this.cur_side = 0;
    }

    $('#content_' + this.sides[this.cur_side] + ' .innards').html(this.posts[this.cur_post])

    var back_side = this.cur_side + 2;
    if (back_side > this.sides.length) back_side = 0;
    $('#content_' + this.sides[back_side] + ' .innards').html('')



    $('#cube').transition({
      rotateX: this.deg + 'deg'
    }, 400)

    this.resize();
  },

  previous: function() {

  }
};

$(function() {
  CUBE.init();
});