(function(){

    var controller = function($scope){
        var vm = this;

        vm.parseObjectLines = function(object,array){

            if(angular.isArray(object)) {
                angular.forEach(object, function (objectSet, lineKey) {
                    if (angular.isArray(objectSet.l)) {
                        angular.forEach(objectSet.l, function (v, k) {
                            var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                            array.push({'indent': indent, 'text': v['#text']})
                        });
                    } else {
                        var indent = angular.isDefined(objectSet.l['@indent']) ? objectSet.l['@indent'] : 0;

                        if (angular.isDefined(objectSet.l.physnumber)) {
                            array.push({'indent': indent, 'text': objectSet.l.physnumber['#text']})
                        } else {
                            array.push({'indent': indent, 'text': objectSet.l['#text']})
                        }
                    }
                });
            } else if (angular.isArray(object.l)){
                angular.forEach(object.l, function (v, k) {
                    var indent = angular.isDefined(v['@indent']) ? v['@indent'] : 0;
                    array.push({'indent': indent, 'text': v['#text']});
                });
            } else {
                var indent = angular.isDefined(object.l['@indent']) ? object.l['@indent'] : 0;

                if (angular.isDefined(object.l.physnumber)) {
                    array.push({'indent': indent, 'text': object.l.physnumber['#text']});
                } else {
                    array.push({'indent': indent, 'text': object.l['#text']});
                }
            }
        };



        //vm.init = function(){
            vm.lines = function(){
                var lines = [];
                if(angular.isObject(vm.object.text)){
                    if(angular.isDefined(vm.object.text.texthead)){
                        vm.parseObjectLines(vm.object.text.texthead,lines);
                    }

                    if(angular.isDefined(vm.object.text.lg)){
                        vm.parseObjectLines(vm.object.text.lg,lines);
                    }
                }
                return lines;
            }
            //console.log(vm.object);
        //}
    }

    controller.$inject = ['$scope'];

    var textTranscription = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/text-transcription/textTranscription.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'trayText',
            bindToController: true
        };
    }

    angular.module('blake').directive('textTranscription', textTranscription);

}());