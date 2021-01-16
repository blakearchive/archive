angular.module("blake").directive('ovpImage', function(imageManipulation){
    var link = function(scope,element,attr){

        var image = angular.element(element.children()),
            container = angular.element(element.parent()),
            height = 0,
            width = 0,
            parentHeight = 0;

        console.log($scope.descId);
        image.on('load',function(){
            height = image[0].naturalHeight;
            width = image[0].naturalWidth;
            parentHeight = container.height();
            if(width > height && $scope.descId != 'bb128.c.te.01' && $scope.descId != 'bb128.c.te.02'){
                var newHeight = Math.round((height * parentHeight / width));
                var margin = Math.round(((parentHeight - newHeight) / 2));
                image.css({'height':'auto','width':parentHeight+'px','margin-top':margin+'px'});
            } else {
                image.css({'height':'100%','width':'auto','margin-top':'0'});
            }
        });

        scope.transformRotate = function(){
            if(imageManipulation.transform.rotate == 0){
                element.removeClass('rotated');
            } else {
                element.addClass('rotated');
            }
        }

        scope.setStyles = function(){
            var tranformString = 'rotate('+imageManipulation.transform.rotate+'deg)';
            imageManipulation.transform.style['-webkit-transform'] = tranformString;
            imageManipulation.transform.style['-moz-tranform'] = tranformString;
            imageManipulation.transform.style['-o-transform'] = tranformString;
            imageManipulation.transform.style['-ms-transform'] = tranformString;
            imageManipulation.transform.style['transform'] = tranformString;
            element.css(imageManipulation.transform.style);
        }


        scope.$watch(function(){return imageManipulation.transform},function(){
            scope.transformRotate();
            scope.setStyles();
        },true);

        scope.$on('resize::resize',function(){
            scope.transformRotate();
            scope.setStyles();
        });


    }

    return{
        restrict: 'A',
        scope: {
            descId: '@descId'
        },
        link: link
    }
});