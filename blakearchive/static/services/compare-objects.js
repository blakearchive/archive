angular.module("blake").factory('CompareObjectsFactory', function(){
    var cof = this;

    cof.main = {};
    cof.comparisonType = '';
    cof.comparisonObjects = [];

    cof.setMainObject = function(obj){
        cof.main = obj;
        if(!cof.isComparisonObject(obj)){
            cof.comparisonObjects.unshift(obj);
        }
    };

    cof.resetComparisonObjects = function(){
        cof.main = {};
        cof.clearComparisonObjects();
    };

    cof.isMain = function(obj){
        if(obj.object_id == cof.main.object_id){
            return true;
        }
        return false;
    }

    cof.addComparisonObject = function (obj) {
        if (!cof.isComparisonObject(obj)) {
            cof.comparisonObjects.push(obj);
        }
    };

    cof.selectAll = function (objects) {
        cof.comparisonObjects = angular.copy(objects);
        if(angular.isDefined(cof.main.object_id)){
            cof.comparisonObjects.unshift(cof.main);
        }
    };

    cof.removeComparisonObject = function (obj) {
        var i;
        for (i = cof.comparisonObjects.length; i--;) {
            if (cof.comparisonObjects[i].object_id == obj.object_id) {
                cof.comparisonObjects.splice(i, 1);
                break;
            }
        }
    };

    cof.clearComparisonObjects = function () {
        cof.comparisonObjects = [];
        cof.comparisonType = '';
        if(angular.isDefined(cof.main.object_id)){
            cof.comparisonObjects.unshift(cof.main);
        }
    };

    cof.isComparisonObject = function (obj,type) {
        if(angular.isDefined(type)){
            if(type != cof.comparisonType){
                return false;
            }
        }
        var i;
        for (i = cof.comparisonObjects.length; i--;) {
            if (cof.comparisonObjects[i].object_id == obj.object_id) {
                return true;
            }
        }
        return false;
    };

    cof.checkCompareType = function(type){
        if(cof.comparisonType != type && cof.comparisonType != ''){
            cof.clearComparisonObjects();
        }
        cof.comparisonType = type;
    };

    cof.hasObjects = function(){
        if (angular.isDefined(cof.comparisonObjects)) {
            return cof.comparisonObjects.length > 0 ? true : false;
        }
        return false;
    };

    return cof;
});