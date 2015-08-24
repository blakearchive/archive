(function($){
  'use strict';

  $(function() {

    // Utility function. Causes the callback to only fire after a delay. If the
    // callback is called before the delay it waits. Useful for rapidly firing callbacks
    // like window.resize
    // -------------------------------------------------------------------

    var response_change = {};

    response_change.waitForIdle = function(fn, delay) {
      var timer = null;
      return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    };


    // Get the width of the window and the postion of the dropdowns.
    // Use that information to position the drop-downs across the screen.
    // ------------------------------------------------------------------

    $(window).on('resize', response_change.waitForIdle(function() {

      if ( $('nav.navbar ul.navbar-nav li.dropdown').hasClass('open') ) {
        var viewport_width = $(window).width();
        var element_position = $('nav.navbar ul.navbar-nav li.dropdown.open').offset().left;

        $('nav.navbar ul.navbar-nav li.dropdown.open').find('ul.dropdown-menu').css({'width': viewport_width + 'px', 'left': '-' + element_position + 'px'});
      }
    }, 100));


    // Remember if the archive menu is open or closed by using local storage.
    // -------------------------------------------------------------------

    var $archive_btn = $('button.collapse-archive');
    var $archive_menu = $('nav.navbar');

    // If the menu hasn't been dismissed, show it.
    var archive_menu_dismissed = 'false';

    if ( localStorage.getItem('archive_menu_dismissed')  === null ) {
      localStorage.setItem('archive_menu_dismissed', archive_menu_dismissed);
    }

    if (localStorage.getItem('archive_menu_dismissed') !== 'true') {
      $archive_btn.addClass('menu-closed').removeClass('menu-open');
      $archive_menu.addClass('menu-closed').removeClass('menu-open');
    } else {
      $archive_menu.addClass('menu-open').removeClass('menu-closed');
      $archive_btn.addClass('menu-open').removeClass('menu-closed');
    }

    // toggle class
    $archive_btn.on('click', function() {
      if ( $archive_menu.hasClass('menu-open') ) {
        $archive_menu.removeClass('menu-open').addClass('menu-closed');
        $archive_btn.removeClass('menu-open').addClass('menu-closed');
        localStorage.setItem('archive_menu_dismissed', archive_menu_dismissed);
      } else {
        $archive_menu.addClass('menu-open').removeClass('menu-closed');
        $archive_btn.addClass('menu-open').removeClass('menu-closed');
        localStorage.setItem('archive_menu_dismissed', 'true');
      }
    });


    // Get the height of the object view carousel.
    // -------------------------------------------------------------------

    // Set the image height for the carousel
    function objectViewHeight() {
      var set_object_view_height = $(window).height() - 220;
      $('#object-view .carousel .featured-object img').css('height', set_object_view_height + 'px');
    }

    if ( $('#object-view .carousel').length ) {
      objectViewHeight();
      $(window).on('resize', response_change.waitForIdle(function() {
        objectViewHeight();
      }, 100));
    }

    // Get the height of the object compare view.
    // -------------------------------------------------------------------

    // Set the image height for the compare view
  /**  function objectCompareHeight() {
      var set_object_compare_height = $(window).height() - 370;
      $('#object-view #compare .featured-object img').css('height', set_object_compare_height + 'px');
    }

    if ( $('#object-view #compare').length ) {
      objectCompareHeight();
      $(window).on('resize', response_change.waitForIdle(function() {
        objectCompareHeight();
      }, 100));
    }

    // Get the height of the object detail.
    // -------------------------------------------------------------------

    // Set the max-height for the detail tray in object view.

    function trayHeight() {
      var set_tray_height = $(window).height() - 86;
      var panel_count = $('.panel-group .panel-default').length;
      var set_tray_body_height = (set_tray_height - (panel_count * 47));

      $('.panel-group').css('min-height', set_tray_height + 'px');
      $('.panel-group .panel-body').css('max-height', set_tray_body_height + 'px');
    }

    if ( $('#object-detail-tray').length ) {
      trayHeight();
      $(window).resize(response_change.waitForIdle(function() {
        trayHeight();
      }, 100));
    }

    // Show thumbnails for the carousel buttons.
    // -------------------------------------------------------------------

    function loadNextObject() {
      if( $('.featured-object .carousel-inner .item.active').is(':last-child') ) {
        var active_first_image = $('.featured-object .carousel-inner .item:first-child img').attr('src').slice(0,-7);
        $('.featured-object-controls a.carousel-control.right .objecticon-right').css('background-image', 'url(' + active_first_image + '100.jpg)');
      } else {
        var active_next_image = $('.featured-object .carousel-inner .item.active').next().find('img').attr('src').slice(0,-7);
        $('.featured-object-controls a.carousel-control.right .objecticon-right').css('background-image', 'url(' + active_next_image + '100.jpg)');
      }
    }

    function loadPrevObject() {
      if( $('.featured-object .carousel-inner .item.active').is(':first-child') ) {
        var active_last_image = $('.featured-object .carousel-inner .item:last-child img').attr('src').slice(0,-7);
        $('.featured-object-controls a.carousel-control.left .objecticon-left').css('background-image', 'url(' + active_last_image + '100.jpg)');
      } else {
        var active_next_image = $('.featured-object .carousel-inner .item.active').prev().find('img').attr('src').slice(0,-7);
        $('.featured-object-controls a.carousel-control.left .objecticon-left').css('background-image', 'url(' + active_next_image + '100.jpg)');
      }
    }

    if ( $('#object-view .carousel').length ) {
      // on load
      loadNextObject();
      loadPrevObject();

      // right
      $('.featured-object-controls a.carousel-control.right').click(function() {
        setTimeout(function() {
          loadNextObject();
          loadPrevObject();
        }, 1000);
      });

      // left
      $('.featured-object-controls a.carousel-control.left').click(function() {
        setTimeout(function() {
          loadNextObject();
          loadPrevObject();
        }, 1000);
      });
    }



    // Create slider layout for compare view.
    // -------------------------------------------------------------------

    function setObjectCompare() {
      var compare_object_width = 0;
      $('#object-view #compare .item').each(function() {
        compare_object_width += Number( $(this).width() );
      });

      $('#object-view #compare .compare-inner').css('width', (compare_object_width + 10) + 'px');
    }

    if ( $('#object-view #compare').length ) {
      setObjectCompare();
      $(window).on('resize', response_change.waitForIdle(function() {
        setObjectCompare();
      }, 100));
    }*/


    // Set the scroller and reset on browser resize.
    // -------------------------------------------------------------------

    $('.scrollbar').scroller({
      customClass: 'advanced',
      trackMargin: 10,
      // handleSize: 40,
      horizontal: true
    });

    $(window).on('resize', response_change.waitForIdle(function() {
      $('.scrollbar').scroller('reset');
    }, 100));


    // Back to top scroll arrow.
    // -------------------------------------------------------------------

    if ( $('.back-top').length ) {

      $('.back-top').on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 'slow');
      });

      $(window).on('scroll', function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 50) {
          $('.back-top').addClass('scrolling');
        } else {
          $('.back-top').removeClass('scrolling');
        }
      });
    }


    // Parallax scroll the homepage panels.
    // -------------------------------------------------------------------

    function parallaxScroll(){
      var scrolled = $(window).scrollTop();
      $('#scroll-wrapper1').css('margin-top',(-90-(scrolled*0.2))+'px');
      $('#scroll-wrapper2').css('margin-top',(-20-(scrolled*0.4))+'px');
      $('#scroll-wrapper3').css('margin-top',(-90-(scrolled*0.14))+'px');
      $('#scroll-wrapper4').css('margin-top',(-20-(scrolled*0.4))+'px');
      $('#scroll-wrapper5').css('margin-top',(-90-(scrolled*0.5))+'px');
      $('#scroll-wrapper6').css('margin-top',(-20-(scrolled*0.3))+'px');
    }

    parallaxScroll();

    if ( $('body.home').length ) {

      $(window).bind('scroll', function(e){
        parallaxScroll();
      });
    }


    // Lazy loader.
    // -------------------------------------------------------------------

    if ( $('body.home').length ) {

      $(function() {
        $("img.lazy-load").lazyload({
          threshold: 100
        });
      });
    }


  }); // document

})(this.jQuery);
