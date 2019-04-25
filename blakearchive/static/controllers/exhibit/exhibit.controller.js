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

    BlakeDataService.getImagesForExhibit(exhibitId).then(function(result){
      vm.images = result;
      //console.log("--------"+vm.images);
      vm.setNextCaption();
    });

    vm.setNextCaption = function() {
      if (currentIndex >= vm.images.length) {
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

      //this timeout needs to be set to execute after the page loads entirely (it can take a while), not after 40 seconds as it is now
      setTimeout(function () {
        var offsetPadding = 0
        var scrollbarWidth = 0
        var captionContainer = document.getElementById('reading-copy-item-0')
        // the following line works, but only when it executes after 40 seconds. it takes 35-40 seconds 
        // for the page to load
        var footnotesInCaptions = document.querySelectorAll("div.reading-copy-inner a[class='footnote']")
        console.log(footnotesInCaptions);
        for (var i = 0; i < footnotesInCaptions.length; i++) {
          footnotesInCaptions[i].addEventListener('mouseenter', function (event) {
            if (this !== event.target) {
              // Only process popup on `mouseenter` for the .footnote anchor not any of the child
              // elements which may trigger this handler.
              return
            }

            var span = event.target.children[0]

            if (typeof span === 'undefined') {
              // Malformed .footnote anchor is missing a child span.
              return
            }

            //something is off in the calculation here. for footnote 1 under 'Plowman' margin-left get
            //set to -30527.9, so nothing shows up when you hover your mouse over footnote 1
            var articleRect = captionContainer.getBoundingClientRect()
            var footnoteSpanRect = span.getBoundingClientRect()
            console.log(articleRect);
            console.log(footnoteSpanRect);

            var footnoteSpanRight = footnoteSpanRect.x + footnoteSpanRect.width
            var articleRight = articleRect.x + articleRect.width

            var offset = 0

            if (footnoteSpanRect.x < articleRect.x) {
              offset = articleRect.x - footnoteSpanRect.x + offsetPadding
              span.style['margin-left'] = offset + 'px'
            } else if ((footnoteSpanRight + offsetPadding + scrollbarWidth) > articleRight) {
              offset = articleRight - footnoteSpanRight - (offsetPadding + scrollbarWidth)
              span.style['margin-left'] = offset + 'px'
            }
          })

          //  Remove adjusted margin when leaving element so that it will be centered if the
          //  article container is resize to be larger by the user.
          footnotesInCaptions[i].addEventListener('mouseleave', function (event) {
            if (this !== event.target) {
              // Only process popup on `mouseenter` for the .footnote anchor not any of the child
              // elements which may trigger this handler.
              return
            }

            var span = event.target.children[0]

            if (typeof span === 'undefined') {
              // Malformed .footnote anchor is missing a child span.
              return
            }

            span.removeAttribute('style')
          })
        }
      }, 40000)

      // Add handler to any newly added footnotes which will properly align the
      // footnote's span if it falls outside of it's parent container.
      setTimeout(function () {
        var articleContainer = document.getElementById('exhibit_article_content')
        var footnotesInArticle = document.querySelectorAll("div[id='exhibit_article_content'] a[class='footnote']")
        console.log(footnotesInArticle);

        // Distance to offset the span from the edge of the container.
        var offsetPadding = 15
        var scrollbarWidth = 30

        for (var i = 0; i < footnotesInArticle.length; i++) {
          footnotesInArticle[i].addEventListener('mouseenter', function (event) {
            if (this !== event.target) {
              // Only process popup on `mouseenter` for the .footnote anchor not any of the child
              // elements which may trigger this handler.
              return
            }

            var span = event.target.children[0]

            if (typeof span === 'undefined') {
              // Malformed .footnote anchor is missing a child span.
              return
            }

            var articleRect = articleContainer.getBoundingClientRect()
            var footnoteSpanRect = span.getBoundingClientRect()

            var footnoteSpanRight = footnoteSpanRect.x + footnoteSpanRect.width
            var articleRight = articleRect.x + articleRect.width

            var offset = 0

            if (footnoteSpanRect.x < articleRect.x) {
              offset = articleRect.x - footnoteSpanRect.x + offsetPadding
              span.style['margin-left'] = offset + 'px'
            } else if ((footnoteSpanRight + offsetPadding + scrollbarWidth) > articleRight) {
              offset = articleRight - footnoteSpanRight - (offsetPadding + scrollbarWidth)
              span.style['margin-left'] = offset + 'px'
            }
          })

          //  Remove adjusted margin when leaving element so that it will be centered if the
          //  article container is resize to be larger by the user.
          footnotesInArticle[i].addEventListener('mouseleave', function (event) {
            if (this !== event.target) {
              // Only process popup on `mouseenter` for the .footnote anchor not any of the child
              // elements which may trigger this handler.
              return
            }

            var span = event.target.children[0]

            if (typeof span === 'undefined') {
              // Malformed .footnote anchor is missing a child span.
              return
            }

            span.removeAttribute('style')
          })
        }

      }, 10)
    });
});
