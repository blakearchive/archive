angular.module("blake").directive('toTopButton', function($window){
    var link = function(scope,element,attr){
        angular.element($window).bind("scroll",function(){
            if(this.pageYOffset > 50){
                element.addClass('scrolling')
            } else {
                element.removeClass('scrolling')
            }
        })
    };

    return{
        restrict: 'A',
        link: link
    }
});