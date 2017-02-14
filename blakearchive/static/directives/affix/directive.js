angular.module("blake").directive('affix', function($window){
      var link = function(scope,element,attr){
          var w = angular.element($window),
            elementOffsetTop = element[0].getBoundingClientRect().top,
            offsetTop = angular.isDefined(attr.offsetTop) ? attr.offsetTop : 0,
            offsetStart = angular.isDefined(attr.offsetStart) ? parseInt(attr.offsetStart) : 0,
            offsetBottom = angular.isDefined(attr.offsetBottom) ? parseInt(attr.offsetBottom) : 0,
            minWidth = angular.isDefined(attr.minWidth) ? parseInt(attr.minWidth) : 0;

          function affixElement() {

              var elementHeight = angular.element(element).height();
              var pageHeight = document.body.scrollHeight;
              var doNotPass =  pageHeight - offsetBottom;


              if (offsetBottom !== 0 && $window.pageYOffset + elementHeight >= doNotPass && pageHeight - offsetBottom > elementHeight){
                  element.css('position', 'absolute');
                  element.css('top','');
                  element.css('bottom','50px');
              } else if ($window.pageYOffset > elementOffsetTop + offsetStart && pageHeight - offsetBottom > elementHeight) {
                  element.css('position', 'fixed');
                  element.css('top', offsetTop+'px');
                  element.css('bottom','');
              } else {
                  element.css('position', '');
                  element.css('top', '');
                  element.css('bottom','');
                  width = element[0].clientWidth;
              }
          }

          function resetWidth() {
              if ($window.pageYOffset > (elementOffsetTop + offsetStart)) {
                  element.css('position', '');
                  element.css('top', '');
                  element.css('bottom','');
                  //element.css('width','100%');
                  //width = element[0].clientWidth;
                  affixElement();
              }
          }

          scope.$on('resize::resize',function(){
              resetWidth();
          });

          w.bind('scroll', affixElement);
      };

      return {
          restrict: 'A',
          link: link
      };
  });