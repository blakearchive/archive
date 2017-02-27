angular.module("blake").directive('autoHeight', function (WindowSize) {
    let link = function (scope, element, attrs) {
        let adjust = scope.$eval(attrs.adjust),
            breakpoint = scope.$eval(attrs.breakpoint),
            divide = scope.$eval(attrs.divide);

        scope.setStyles = function (windowSize) {
            if(windowSize.width < breakpoint){
                element.height('auto');
            } else {
                let newHeight = (windowSize.height - adjust);
                if(divide){
                    newHeight = newHeight / divide;
                }
                console.log("setting height: " + newHeight);
                element.height(newHeight);
            }
        };

        scope.setStyles(WindowSize);


        scope.$on('resize::resize', function (e, w) {
            element = e
            scope.setStyles(w)
        });
    };
    return {
        restrict: 'A',
        link: link
    };
});