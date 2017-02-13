angular.module("blake").controller("ObjectsInVirtualWorkPreviewController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("objectsInVirtualWorkPreview", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "ObjectsInVirtualWorkPreviewController",
        bindToController: true,
        scope: {
            results: '<results',
            tree: '<tree'
        },
        controllerAs: "ovw",
        replace: true
    }
});