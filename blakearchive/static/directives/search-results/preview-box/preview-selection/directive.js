angular.module("blake").controller("PreviewSelectionController", function (SearchService, scope) {
    let vm = this;
    vm.s = SearchService;

        let results = scope.$eval(attrs.results),
            type = scope.$eval(attrs.type),
            tree = scope.$eval(attrs.tree);
});

angular.module("blake").directive("previewSelection", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "PreviewSelectionController",
        bindToController: true,
        controllerAs: "ps",
    }
});