angular.module("blake").directive('autoHeight', function (WindowSize, $rootScope) {
    let link = function (scope, element, attrs) {
        let adjust = scope.$eval(attrs.adjust),
            breakpoint = scope.$eval(attrs.breakpoint),
            divide = scope.$eval(attrs.divide);

        function setStyles (windowSize) {
            if(windowSize.width < breakpoint){
                element.height('auto');
            } else {
                let newHeight = (windowSize.height - adjust);
                if(divide){
                    newHeight = newHeight / divide;
                }
                //console.log("setting height: " + newHeight);
                element.height(newHeight);
            }
        }

        setStyles(WindowSize);


        $rootScope.$on('resize::resize', function (e, w) {
            setStyles(w)
        });
    };
    return {
        restrict: 'A',
        link: link
    };
});