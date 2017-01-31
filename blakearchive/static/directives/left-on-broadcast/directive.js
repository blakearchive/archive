angular.module("blake").directive('leftOnBroadcast', function($timeout){
    var link = function(scope,element,attr) {
        if(attr.leftOnBroadcast){
            scope.$on(attr.leftOnBroadcast,function($event,$data){
                if($data.target){
                    $timeout(function(){
                        var offset = $(element).find($data.target)[0].offsetLeft;
                        $(element).animate({scrollLeft: offset}, 'fast');
                    },300);

                }
            });
        }
    };

    return{
        restrict: 'A',
        link: link
    }
});