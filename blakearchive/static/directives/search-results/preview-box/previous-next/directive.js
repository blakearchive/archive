angular.module("blake").controller("PreviousNextController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;

    vm.showLeft = function () {
        return vm.s.selectedWork > 0;
    };

    vm.showRight = function () {
        return vm.s.selectedWork < (vm.results.length - 1);
    };
});

angular.module("blake").directive("previousNext", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviousNextController",
        bindToController: true,
        scope: {
            results: '<results',
            type: '<type'
        },
        controllerAs: "pn"
    }
});