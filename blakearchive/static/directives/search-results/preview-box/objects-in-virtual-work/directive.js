angular.module("blake").controller("ObjectsInVirtualWorkPreviewController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").component("objectsInVirtualWorkPreview", {
    template: require("html-loader!./template.html"),
    controller: "ObjectsInVirtualWorkController",
    scope: {
        results: '=results',
        tree: '@tree'
    },
    controllerAs: "ovw"
});