angular.module("blake").controller("ObjectResultHighlightController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
    
    vm.selectedObject = function () {
        try {
            return vm.results[vm.s.selectedWork][2][vm.s.selectedCopy][2][vm.s.selectedObject][0];
        } catch (e) {}
    };

    vm.selectedCopy = function () {
        try {
            return vm.results[vm.s.selectedWork][2][vm.s.selectedCopy][0];
        } catch (e) {}
    };

    vm.selectedWork = function () {
        try {
            return vm.results[vm.s.selectedWork][0];
        } catch (e) {}
    };
});

angular.module("blake").directive("objectResultHighlight", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "ObjectResultHighlightController",
        bindToController: true,
        scope: {
            results: '<results',
            tree: '<tree',
            type: '<type'
        },
        controllerAs: "orh",
        replace: true
    }
});