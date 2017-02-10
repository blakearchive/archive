angular.module("blake").controller("MediumSearchFieldController", function (SearchService) {
    let vm = this;
    vm.s = SearchService;
});

angular.module("blake").directive("mediumSearchField", function () {
    return {
        template: require("html-loader!./template.html"),
        controller: "MediumSearchFieldController",
        controllerAs: "msf",
        replace: true
    }
});