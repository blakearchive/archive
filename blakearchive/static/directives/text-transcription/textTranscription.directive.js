(function(){

    var controller = function(){
        var vm = this;

        vm.getNumber = function(num){
            return new Array(parseInt(num));
        }
    }

    var textTranscription = function(){
        return {
            restrict: 'EA',
            templateUrl: '/blake/static/directives/text-transcription/textTranscription.html',
            controller: controller,
            scope: {
                object: '=object',
            },
            controllerAs: 'textCtrl',
            bindToController: true
        };
    }

    angular.module('blake').directive('textTranscription', textTranscription);

}());