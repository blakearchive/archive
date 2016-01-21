/**
 * Created by lukeluke on 1/21/16.
 */

angular.module('blake').directive("copyTabs", function () {
    return {
        restrict: 'E',
        templateUrl: "/blake/static/directives/copy-tabs/template.html",
        controller: "CopyTabsController"
    }
});

angular.module('blake').controller("CopyTabsController",['$scope', 'BlakeDataService', function ($scope, BlakeDataService) {

    $scope.BlakeDataService = BlakeDataService;


    $scope.$on("objectSelectionChange", function () {

        $scope.tabs = {};

        $scope.tabs['1'] = {'href':'#objects-in-copy','name':'Objects in Copy','active':'active'};

        var obj = BlakeDataService.getSelectedObject();
        if (obj) {
            BlakeDataService.getObjectsFromSameMatrix(obj.object_id).then(function (data) {
                if(BlakeDataService.hasObjectsFromSameMatrix()){
                    $scope.tabs['2'] = {'href':'#objects-from-same-matrix','name':'Objects Printed from the Same Matrix'}
                }
            });
            BlakeDataService.getObjectsFromSameProductionSequence(obj.object_id).then(function (data) {
                if(BlakeDataService.hasObjectsFromSameProductionSequence()){
                    $scope.tabs['3'] = {'href':'#objects-from-same-production-sequence','name':'Objects from the Same Production Sequence'};
                }
            });
            BlakeDataService.getObjectsWithSameMotif(obj.object_id).then(function (data) {
                if(BlakeDataService.hasObjectsWithSameMotif()){
                    $scope.tabs['4'] = {'href':'#objects-with-same-motif','name':'Objects with the Same Motif'};
                }
            });
        }

        $scope.tabs['99'] = {'href':'#copy-info','name':'Copy Information'};
        $scope.selectedTab = '#objects-in-copy';

    });

    $scope.selectedTab = '#objects-in-copy';

    $scope.showTab = function(id){
        angular.forEach($scope.tabs,function(value,key){
            if(value.href == id){
               value.active = 'active';
            } else {
               value.active = '';
            }
            /*$('.tab-pane').removeClass('active in');
            $(id).addClass('active in');*/
            $scope.selectedTab = id;
        });
    }



    /*if(BlakeDataService.hasObjectsFromSameMatrix()){
        console.log('true');
        //$scope.tabs.push({'href':'#objects-from-same-matrix','name': 'Objects Printed from the Same Matrix'});
    } else {
        console.log('false');
    }*/

    //$scope.tabs.push({'href':'#copy-information','name':'Copy Information'});

    //console.log($scope.obj);

}]);