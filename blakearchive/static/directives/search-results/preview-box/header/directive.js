angular.module("blake").controller("PreviewHeaderController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("previewHeader", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewHeaderController",
        scope: {
            results: '=results',
            tree: '@tree'
        },
        controllerAs: "ph",
        replace: true
    }
});