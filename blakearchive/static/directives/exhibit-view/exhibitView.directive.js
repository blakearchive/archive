angular.module("blake").controller("ExhibitViewController",
    function($rootScope, BlakeDataService, $scope, $modal, $cookies, $window,$http) {
    var vm = this;
    vm.bds = BlakeDataService;

    //vm.exhibitId = 'illum';

    console.log("bds exhibitId: =="+vm.exhibitId+"==");
    var htmlPath = "/api/exhibit-html/"+vm.exhibitId;//+vm.bds.exhibit.exhibit_id;

    // given an exhibit, get it's html content put it in a var
    $http.get(htmlPath).then(function(response){
      vm.exhibit_article_content = response.data;
    });


    console.log("htmlPath: =="+htmlPath+"==");
});

angular.module('blake').directive("exhibitView", function() {
    return {
        restrict: 'E',
        template: require('html-loader!./exhibitView.html'),
        controller: "ExhibitViewController",
        controllerAs: 'exhibit',
        scope: {
            exhibitId: '@exhibitId'
        },
        bindToController: true
    };
});
