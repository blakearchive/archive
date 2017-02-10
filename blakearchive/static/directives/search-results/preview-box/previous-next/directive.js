angular.module("blake").controller("PreviousNextController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("previousNext", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviousNextController",
        scope: {
            results: '=results',
            type: '=type'
        },
        controllerAs: "pn",
        replace: "true"
    }
});