angular.module("blake").controller("TextTranscriptionController", function($routeParams, $modal){
    let vm = this;

    vm.colorKeyOpen = function(size){
        $modal.open({
            templateUrl: '/static/controllers/modal/colorKeyModal.html',
            controller: 'ModalController',
            size: size
        });
    };

    let teiClasses = [
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
        'tei-preceding-addspan',
        'hi'
    ];

    vm.hasColorKeyMarkup = function(teiMarkup){
        let regex = new RegExp('('+teiClasses.join('|')+')','g');

        if(teiMarkup){
            if(teiMarkup.match(regex)){
                return true;
            }
        }
        return false;
    };

    vm.getNumber = function(num){
        return new Array(parseInt(num));
    };

    vm.hasMarkupText = function () {
        return vm.object && vm.object.markup_text;
    }
});


angular.module('blake').directive('textTranscription', function(){
    return {
        restrict: 'EA',
        templateUrl: '/static/directives/text-transcription/textTranscription.html',
        controller: "TextTranscriptionController",
        scope: {
            object: '=object',
            highlight: '@highlight'
        },
        controllerAs: 'tt',
        bindToController: true
    };
});