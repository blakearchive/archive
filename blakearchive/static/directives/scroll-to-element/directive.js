//TODO make this a true scroll to element, rather than simple offset of current element
angular.module("blake").directive('scrollToElement', function($timeout){

    var link = function(scope,element,attr) {
        element.on('click',function(){
            let startingOffset = element.offset() - 100;
            $timeout(function () {
                let elementOffset = attr.scrollToElement ? $(attr.scrollToElement).offset() : startingOffset,
                    offset = scope.offset ? parseInt(scope.offset) : 0;
                $('html, body').animate({scrollTop: (elementOffset.top - offset)}, 'slow');
            }, 300);
        })
    };

    return{
        restrict: 'A',
        scope:{
            offset: '@offset'
        },
        link: link,
    }
});