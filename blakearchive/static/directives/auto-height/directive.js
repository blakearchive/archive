angular.module("blake").directive('autoHeight', function (WindowSize) {
    var link = function (scope, element, attrs) {

        scope.setStyles = function (windowSize) {
            if(windowSize.width < scope.breakpoint){
                element.height('auto');
            } else {
                var newHeight = (windowSize.height - scope.adjust);
                if(scope.divide){
                    newHeight = newHeight / scope.divide;
                }
                element.height(newHeight);
            }
        }

        scope.setStyles(WindowSize);


        scope.$on('resize::resize', function (e, w) {
            scope.setStyles(w)
        });
    };
    return {
        restrict: 'A',
        link: link,
        scope: {
            'adjust': '@adjust',
            'breakpoint': '@breakpoint',
            'divide': '@divide'
        }
    };
});