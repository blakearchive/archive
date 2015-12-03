/**
 * Created by nathan on 2/13/15.
 */

angular.module('blake').directive("objectCompare", function () {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: "/blake/static/directives/object-compare/template.html",
        controller: "ObjectCompareController"
    }
});

angular.module('blake').controller("ObjectCompareController",['$scope', '$timeout', 'Fullscreen', 'BlakeDataService', 'UtilityServices', function ($scope, $timeout, Fullscreen, BlakeDataService, UtilityServices) {

    $scope.BlakeDataService = BlakeDataService;

    $scope.updateCopyInfo = function(copyId, objectId) {
        var copy_num = copyId.split('.')
            .slice(0, 2)
            .join('.');

        $scope.copy = BlakeDataService.setSelectedCopy(copy_num, objectId);
    };

    $scope.getObjLines = function () {
        var objLines = [];
        if ($scope.obj) {
            if ($scope.obj.text.lg !== undefined && $scope.obj.text.lg !== null && $scope.obj.text.lg.length) {
                objLines = UtilityServices.imageText($scope, objLines);
            }
        }

        return objLines;
    };

    // Just need a function reference here
    $scope.toggleTray = UtilityServices.togglingTray;

     // Set viewer height
    $scope.compareViewerHeight = UtilityServices.imageViewerHeight() + 'px';
    $scope.compareImageHeight = ($scope.compareViewerHeight.split('px')[0] - 125)  + 'px';

    // Open an info panel in fullscreen mode
    $scope.goFullscreen = function(panel_id) {
        UtilityServices.fullScreen(Fullscreen, panel_id);
    };
    // Reset to previous panel dimensions, set by UtilityServices.trayHeight
    UtilityServices.resetPanelFromFullscreen(Fullscreen);

    $scope.comparisonObjects = BlakeDataService.getComparisonObjects();
    $scope.obj = BlakeDataService.getSelectedObject();

    $scope.$on("comparisonObjectsChange", function () {
        $scope.comparisonObjects = BlakeDataService.getComparisonObjects();
    });

    $scope.$on("objectSelectionChange", function () {
        $scope.obj = BlakeDataService.getSelectedObject();
    });

    // Horizontal Scroll with fixed height/width images
    var response_change = UtilityServices.responseChange();

    function setObjectCompare() {
      var compare_object_width = 0;
      $('#object-view #compare .item').each(function() {
        compare_object_width += Number( $(this).width() );
      });

      $('#object-view #compare .compare-inner').css('width', (compare_object_width + 10) + 'px');
    }

    function objectCompareHeight() {
      var set_object_compare_height = $(window).height() - 370;
      $('#object-view #compare .featured-object img').css('height', set_object_compare_height + 'px');
    }

    angular.element(document).ready(function () {
        $timeout(function() {
            setObjectCompare();
            objectCompareHeight();

            var object_view = $("div.compare-inner");

            // Set the max-height for the detail tray in object view.
            if ( $('#object-detail-tray').length ) {
                UtilityServices.trayHeight(object_view);

                object_view.resize(response_change.waitForIdle(function() {
                    UtilityServices.trayHeight(object_view);
                }, 10));
            }
        }, 0);
    });

    $(window).on('resize', response_change.waitForIdle(function() {
        setObjectCompare();
        objectCompareHeight();
    }, 100));
}]);