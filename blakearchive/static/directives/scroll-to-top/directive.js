angular.module("blake").directive('scrollToTop',function(){
    var link = function(scope,element,attr) {
        element.on('click',function(){
            $('html, body').animate({scrollTop: 0}, 'fast');
            $("#Overlay").animate({scrollTop: 0}, 'fast');
        })
    };

    return{
        restrict: 'A',
        link: link
    }
});