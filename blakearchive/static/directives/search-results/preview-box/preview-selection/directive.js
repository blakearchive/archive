angular.module("blake").controller("PreviewSelectionController", function (SearchService, WindowSize) {
    let vm = this;
    vm.s = SearchService;

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
            scope.setStyles(w)
        });
    };


});

angular.module("blake").directive("previewSelection", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewSelectionController",
        bindToController: true,
        scope: {
            results: '<results',
            type: '<type',
            tree: '<tree'
        },
        link: link,
        controllerAs: "ps",
    }
});