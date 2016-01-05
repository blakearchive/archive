/**
 * Created by nathan on 2/13/15.
 */

angular.module('blake').directive("objectViewer", function () {
    return {
        restrict: 'E',
        templateUrl: "/blake/static/directives/object-viewer/template.html",
        controller: "ObjectViewerController"
    }
});

angular.module('blake').controller("ObjectViewerController",['$rootScope', '$scope', '$timeout', 'BlakeDataService', 'UtilityServices', function ($rootScope, $scope, $timeout, BlakeDataService, UtilityServices) {
    $rootScope.showSubMenu = 1;
    $scope.BlakeDataService = BlakeDataService;

    $scope.getPreviousNextObjects = function () {
        if ($scope.objects && $scope.objects.length) {
            for (var i = $scope.objects.length; i--;) {
                if ($scope.objects[i].object_id == $scope.obj.object_id) {
                    // Extra code here to make the list circular
                    if (i - 1 < 0) {
                        $scope.previousObject = $scope.objects[$scope.objects.length - 1];
                    } else {
                        $scope.previousObject = $scope.objects[i - 1];
                    }
                    if (i + 1 >= $scope.objects.length) {
                        $scope.nextObject = $scope.objects[0];
                    } else {
                        $scope.nextObject = $scope.objects[i + 1];
                    }
                    break;
                }
            }
        }
    };

    $scope.getObjLines = function () {
        var objLines = [];
        if ($scope.obj) {
            if ($scope.obj.text && $scope.obj.text.lg && $scope.obj.text.lg.length) {
                objLines = UtilityServices.imageText($scope, objLines);
            }
        }
        return objLines;
    };

    // Just need a function reference here
    $scope.toggleTray = UtilityServices.togglingTray;

    $scope.openWindow = function(e) {
        var full_text = e.target.innerHTML;
        window.open('http://www.blakearchive.org/blake/')
    };

    // Set viewer height
    $scope.viewerHeight = UtilityServices.imageViewerHeight() + 'px';
    $scope.imageHeight = ($scope.viewerHeight.split('px')[0] - 50)  + 'px';

    $scope.copy = BlakeDataService.getSelectedCopy();
    $scope.objects = BlakeDataService.getSelectedCopyObjects();
    $scope.obj = BlakeDataService.getSelectedObject();
    if ($scope.copy && !$scope.work) {
        BlakeDataService.setSelectedWork($scope.copy.bad_id)
    } else {
        $scope.work = BlakeDataService.getSelectedWork();
    }

    $scope.getPreviousNextObjects();

    $scope.$on("copySelectionChange", function () {
        $scope.copy = BlakeDataService.getSelectedCopy();
        UtilityServices.getImageHeight(100, $timeout);
    });

    $scope.$on("copySelectionObjectsChange", function () {
        $scope.objects = BlakeDataService.getSelectedCopyObjects();
        UtilityServices.getImageHeight(100, $timeout);
    });

    $scope.$on("objectSelectionChange", function () {
        $scope.obj = BlakeDataService.getSelectedObject();
        $scope.getPreviousNextObjects();
        UtilityServices.getImageHeight(100, $timeout);
    });

    $scope.$on("workSelectionChange", function () {
        $scope.work = BlakeDataService.getSelectedWork();
    });
}]);