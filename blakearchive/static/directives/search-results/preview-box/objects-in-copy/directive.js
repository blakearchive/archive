angular.module("blake").controller("ObjectsInCopyPreviewController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("objectsInCopyPreview", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "ObjectsInCopyPreviewController",
        bindToController: true,
        scope: {
            results: '<results',
            tree: '<tree'
        },
        controllerAs: "oc",
        replace: true
    }
});