(function(){

    var controller = function(){
        var vm = this;
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