angular.module('blake').controller('ExhibitController', function (
  $scope,$routeParams,$sce,$rootScope,$window,$modal,$cookies,
  BlakeDataService,imageManipulation,CompareObjectsFactory,$http) {
    var vm = this;
    var exhibitId = $routeParams.exhibitId;
    vm.exId = exhibitId;
    vm.images = [];
    vm.captions = [];
    $rootScope.showWorkTitle = 'exhibit';
    $rootScope.help = 'exhibit';
    $rootScope.worksNavState = false;
    var currentIndex = 0;
    $rootScope.showArticle = true;
    $rootScope.activeapparatus = 'none';
    $rootScope.borderleftwidth = '13px';
    $rootScope.thumbsliderwidth = '66%';
    $rootScope.thumbslidermarginleft = '13px';
    $rootScope.buttonsleft = '74%';
    $rootScope.galleriesMarginLeft = '33%';
    $rootScope.zoom = false;

    //vm.the_exhibit = BlakeDataService.getExhibit(exhibitId);

    vm.zoom = function() {
        $rootScope.zoom = !$rootScope.zoom;
        ////console.log($rootScope.zoom);
    };

    vm.toggleArticle = function() {
        if($rootScope.showArticle == true) {
          $rootScope.showArticle = false;
          $rootScope.activeapparatus = 'galleriesonly';
          $rootScope.borderleftwidth = '0px';
          $rootScope.thumbsliderwidth = '100%';
          $rootScope.thumbslidermarginleft = '0px';
          $rootScope.buttonsleft = '82.75%';
          $rootScope.galleriesMarginLeft = '0%'
        }
        else {
          $rootScope.showArticle = true;
          $rootScope.activeapparatus = 'none';
          $rootScope.borderleftwidth = '13px';
          $rootScope.thumbsliderwidth = '66%';
          $rootScope.thumbslidermarginleft = '13px';
          $rootScope.buttonsleft = '74%';
          $rootScope.galleriesMarginLeft = '33%';
        }

    }

    /**
     * Bind handlers to a set of footnotes to adjust their position when the user
     * hovers on them. Ensure that the footnote does not overflow its container.
     *
     * Each footnote should have a span element. On `mouseenter`, if the span would
     * overlap the left or right edge of its container, a positive or negative
     * `margin-left` inline style will be applied to move the span so it doesn't
     * overlap.
     *
     * On `mouseleave``the `margin-left` is removed. This ensures that if the user
     * resizes the window causing the span to not overlap, it will return to its
     * normal, unmodified, position.
     *
     * @param  {NodeList} footnotes
     *   A collection of footnote anchors to bind handlers to.
     * @param  {string} containerSelector
     *   A selector to pass to `element.closest()` which will determine the parent
     *   container of the footnote`to consider when calculating overflow.
     */
    var bindFootnoteHoverHandlers = function (footnotes, containerSelector) {
      // Distance to offset the span from the edge of the container.
      var offsetPadding = 15
      var scrollbarWidth = 30

      for (var i = 0; i < footnotes.length; i++) {
        footnotes[i].addEventListener('mouseenter', function (event) {
          if (this !== event.target) {
            // Only process `mouseenter` for the footnote. Skip this
            // if the event is firing on a child element (e.g. the span).
            return
          }

          var span = event.target.children[0]

          if (typeof span === 'undefined') {
            // Malformed footnote is missing a child span.
            return
          }

          var container = this.closest(containerSelector)

          var containerRect = container.getBoundingClientRect()
          var footnoteSpanRect = span.getBoundingClientRect()

          var footnoteSpanRight = footnoteSpanRect.x + footnoteSpanRect.width
          var containerRight = containerRect.x + containerRect.width

          var offset = 0

          if (footnoteSpanRect.x < containerRect.x) {
            offset = containerRect.x - footnoteSpanRect.x + offsetPadding
            span.style['margin-left'] = offset + 'px'
          } else if ((footnoteSpanRight + offsetPadding + scrollbarWidth) > containerRight) {
            offset = containerRight - footnoteSpanRight - (offsetPadding + scrollbarWidth)
            span.style['margin-left'] = offset + 'px'
          }
        })

        //  Remove adjusted margin when leaving element so that it will be unmodified if the
        //  article container is resized to be larger by the user.
        footnotes[i].addEventListener('mouseleave', function (event) {
          if (this !== event.target) {
            // Only process `mouseleave` for the footnote. Skip this
            // if the event is firing on a child element (e.g. the span).
            return
          }

          var span = event.target.children[0]

          if (typeof span === 'undefined') {
            // Malformed footnote is missing a child span.
            return
          }

          span.removeAttribute('style')
        })
      }
    }

    BlakeDataService.getImagesForExhibit(exhibitId).then(function(result){
      vm.images = result;
      //console.log("--------"+vm.images);
      vm.setNextCaption();
    });

    vm.setNextCaption = function() {
      if (currentIndex >= vm.images.length) {
        // Add handler to any newly added footnotes which will properly align the
        // footnote's span if it falls outside of it's parent container.
        setTimeout(function () {
          var footnotes = document.querySelectorAll('.reading-wrapper .footnote')

          bindFootnoteHoverHandlers(footnotes, '.reading-copy-inner')
        }, 10)

        return;
      }
      BlakeDataService.getCaptionsForImage(exhibitId, vm.images[currentIndex++].image_id).then(function(r2){
          vm.captions.push(r2);
          vm.setNextCaption();
      });
    }

    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    vm.scrollTo = function(id) {
        $rootScope.doneSettingCopy = true;
        var target = '#'+id;
        $rootScope.$broadcast('viewSubMenu::readingMode',{'target': target});
        console.log(target);
    }

//vm.images = ["1.1","1.2","1.3"];
//vm.captions = [["ad;lkj","woeijf","Lorem ipsum dolor sit amet, oratio assueverit interpretaris cu quo, his te feugiat legimus. Wisi lorem ius id. Usu ea hinc saepe dictas. Ea regione delectus recusabo quo, in his brute atqui sapientem. At per hinc assum adversarium, duo mandamus voluptatum no. Primis semper constituto te qui. Tale zril aperiam eam ea, phaedrum salutatus tincidunt per cu. Ea exerci urbanitas duo, graeci pertinacia ne pri. Pro suscipiantur disputationi ex. Duo te quidam eripuit consequuntur, definiebas interpretaris cu cum. Qui oportere forensibus contentiones ne, nec lorem omittantur ne. Habeo debet iisque has in, sed id aperiam nostrud neglegentur."],["Mr. Wong noted that getting a small fleet of the trikes on the street and putting them to work would help grow awareness. With so many New Yorkers are always on the street, this should make for easy marketing, not only the bemused citizenry (that’s normal every time they take a prototype out) but also delivery people and executives — potential customers, in other words.","Mr. Wong noted that getting a small fleet of the trikes on the street and putting them to work would help grow awareness. With so many New Yorkers are always on the street, this should make for easy marketing, not only the bemused citizenry (that’s normal every time they take a prototype out) but also delivery people and executives — potential customers, in other words.","opueie"],["zc./mv","Mr. Wong noted that getting a small fleet of the trikes on the street and putting them to work would help grow awareness. With so many New Yorkers are always on the street, this should make for easy marketing, not only the bemused citizenry (that’s normal every time they take a prototype out) but also delivery people and executives — potential customers, in other words.","zckj"]];


    vm.bds= BlakeDataService;
    console.log("Exhibit ID: "+exhibitId);

    $rootScope.doneSettingExhibit = false;
    vm.bds.setSelectedExhibit(exhibitId).then(function(){
      //console.log(">>>>>hey, tae, you were wrong!!!!");
      $rootScope.doneSettingExhibit = true;
      console.log(vm.bds.exhibit);
      vm.scrollTo(1);
    });
    //console.log("===>>>>"+JSON.stringify(vm.bds));
    $http.get("/api/exhibit-html/"+exhibitId).then(function(response){
      vm.exhibit_article_content = $sce.trustAsHtml(response.data);

      // Add handler to any newly added footnotes which will properly align the
      // footnote's span if it falls outside of it's parent container.
      setTimeout(function () {
        var footnotes = document.querySelectorAll("div[id='exhibit_article_content'] a[class='footnote']")
        bindFootnoteHoverHandlers(footnotes, '#exhibit_article_content')
      }, 10)
    });
});
