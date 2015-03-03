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

angular.module('blake').controller("ObjectViewerController", function ($scope, BlakeDataService) {

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
            $scope.obj.text.lg.forEach(function (lg) {
                lg.l.forEach(function (l) {
                    objLines.push(l["#text"]);
                })
            });
        }
        return objLines;
    };

    $scope.toggleTray = function () {
        var $detail_tray = $('#object-container');

        if ($detail_tray.hasClass('tray-closed')) {
            $detail_tray.removeClass('tray-closed').addClass('tray-open');
            setTimeout(function () {
                $('.scrollbar').scroller('reset');
            }, 300);
            $('.scrollbar').scroller('reset');
        } else {
            $detail_tray.removeClass('tray-open').addClass('tray-closed');
            $('.scrollbar').scroller('reset');
            setTimeout(function () {
                $('.scrollbar').scroller('reset');
            }, 300);
        }
    };


    $scope.copy = BlakeDataService.getSelectedCopy();
    $scope.objects = BlakeDataService.getSelectedCopyObjects();
    $scope.obj = BlakeDataService.getSelectedObject();
    $scope.getPreviousNextObjects();

    $scope.$on("copySelectionChange", function () {
        $scope.copy = BlakeDataService.getSelectedCopy();
    });

    $scope.$on("copySelectionObjectsChange", function () {
        $scope.objects = BlakeDataService.getSelectedCopyObjects();
    });

    $scope.$on("objectSelectionChange", function () {
        $scope.obj = BlakeDataService.getSelectedObject();
        $scope.getPreviousNextObjects();
    })
});