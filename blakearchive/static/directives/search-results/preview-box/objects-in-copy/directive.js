angular.module("blake").controller("ObjectsInCopyPreviewController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").component("objectsInCopyPreview", {
    template: require("html-loader!./template.html"),
    controller: "ObjectsInCopyController",
    scope: {
        results: '=results',
        tree: '@tree'
    },
    controllerAs: "oc"
});