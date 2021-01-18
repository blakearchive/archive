angular.module("blake").directive('openseadragon', function($scope){
	$scope.options = {
            prefixUrl: "http://openseadragon.github.io/openseadragon/images/",
            tileSources: [
                "example-images/highsmith/highsmith.dzi"
            ]
        };
});