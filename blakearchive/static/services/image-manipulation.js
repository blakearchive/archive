angular.module("blake").factory('imageManipulation',function(){
    var imageManipulation = {};

    imageManipulation.transform = {
        'rotate':0,
        'scale':1,
        'style': {},
        'orientation':1
    }

    imageManipulation.rotate = function(){
        imageManipulation.transform.rotate = imageManipulation.transform.rotate + 90;

        imageManipulation.transform.orientation += 1;
        if(imageManipulation.transform.orientation == 5){
            imageManipulation.transform.orientation = 1;
        }
    }

    imageManipulation.reset = function(){
        imageManipulation.transform = {
            'rotate':0,
            'scale':1,
            'style': {},
            'orientation':1
        }
    }

    return imageManipulation;
});