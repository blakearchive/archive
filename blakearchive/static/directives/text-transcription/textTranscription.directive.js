angular.module("blake").controller("TextTranscriptionController", function($routeParams, $modal){
    var vm = this;

    vm.colorKeyOpen = function(size){
        var colorKeyModalInstance = $modal.open({
            templateUrl: '/static/controllers/modal/colorKeyModal.html',
            controller: 'ModalController',
            size: size
        });
    }

    vm.hasColorKeyMarkup = function(teiMarkup){
        var teiClasses = [
            'tei-sic',
            'tei-rep-overwrite',
            'tei-rep',
            'tei-del-overwrite',
            'tei-del-erasure',
            'tei-del-obscured',
            'tei-del-overstrike',
            'tei-del',
            'tei-instr-pencil',
            'tei-unclear-hi',
            'tei-subst',
            'tei-addspan-substspan',
            'tei-add-substspan',
            'tei-add',
            'tei-gap-cancellation',
            'tei-gap',
            'tei-hspace',
            'tei-preceding-delspan-substspan',
            'tei-preceding-delspan',
            'tei-preceding-addspan-substspan',
            'tei-preceding-addspan'
        ];

        var regex = new RegExp('('+teiClasses.join('|')+')','g');

        if(teiMarkup){
            if(teiMarkup.match(regex)){
                return true;
            }
        }

        return false;
    }

    vm.getNumber = function(num){
        return new Array(parseInt(num));
    }
});


angular.module('blake').directive('textTranscription', function(){
    return {
        restrict: 'EA',
        templateUrl: '/static/directives/text-transcription/textTranscription.html',
        controller: controller,
        scope: {
            object: '=object',
            highlight: '@highlight'
        },
        controllerAs: 'textCtrl',
        bindToController: true
    };
});