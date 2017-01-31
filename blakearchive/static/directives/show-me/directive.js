angular.module("blake").directive('showMe', function($window){
    return{
        restrict: 'A',
        link: function(scope,ele,attr){
            ele.on('click',function(){
                $window.open('/new-window/'+attr.showMe+'/'+scope.copyBad+'?descId='+scope.object.desc_id, '_blank','width=800, height=600');
            })
        },
        scope:{
            object: '=',
            copyBad: '@'
        }
    }
});