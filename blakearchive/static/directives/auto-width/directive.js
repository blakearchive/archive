angular.module("blake").directive('autoWidth', function (WindowSize) {
    let link = function (scope, element, attrs) {

        scope.setStyles = function (windowSize) {
            if(windowSize.width < scope.breakpoint){
                element.width('');
            } else {
                let newWidth = (windowSize.width - scope.adjust);
                if(scope.percent){
                    newWidth = newWidth * scope.percent;
                }
                if(scope.divide){
                    newWidth = newWidth / scope.divide;
                }
                element.width(newWidth);
            }
        };

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
            'divide': '@divide',
            'percent': '@percent'
        }
    };
});