angular.module("blake").directive('leftOnBroadcast', function($timeout,$rootScope){
    var link = function(scope,element,attr) {
        if(attr.leftOnBroadcast){
            scope.$on(attr.leftOnBroadcast,function($event,$data){
                if($data.target && $rootScope.doneSettingCopy){
                    $timeout(function(){
                        console.log(element);
                        console.log($data.target);
                        console.log(find($data.target)[0]);
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