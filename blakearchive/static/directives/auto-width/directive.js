angular.module("blake").directive('autoWidth', function (WindowSize) {
    let link = function (scope, element, attrs) {

        let adjust = scope.$eval(attrs.adjust),
            breakpoint = scope.$eval(attrs.breakpoint),
            divide = scope.$eval(attrs.divide),
            percent = scope.$eval(attrs.percent);

        scope.setStyles = function (windowSize) {
            if(windowSize.width < breakpoint){
                element.width('');
            } else {
                let newWidth = (windowSize.width - adjust);
                if (percent){
                    newWidth = newWidth * percent;
                }
                if (divide){
                    newWidth = newWidth / divide;
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
        link: link
    };
});