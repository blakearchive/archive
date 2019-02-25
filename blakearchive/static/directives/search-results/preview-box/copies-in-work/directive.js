angular.module("blake").controller("CopiesInWorkPreviewController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("copiesInWorkPreview", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "CopiesInWorkPreviewController",
        bindToController: true,
        scope: {
            results: '<results',
            tree: '<tree'
        },
        controllerAs: "cw",
        replace: true
    }
});