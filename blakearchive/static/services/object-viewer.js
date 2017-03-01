angular.module("blake").factory("ObjectViewerService", function (BlakeDataService, $modal, $rootScope) {
    let ovs = {};
    ovs.bds = BlakeDataService;

    ovs.userestrictOpen = function(copy,object){
        let header = copy.header.userestrict ? copy.header.userestrict['#text'] : object.header.userestrict['#text'];
        let template = 
            `<div class="modal-header">
                <button type="button" class="close" ng-click="close()" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">Use Restriction</h4>
            </div>
            <div class="modal-body">
                <div>${header}</div>
            </div>`;

        $modal.open({
            template: template,
            controller: 'ModalController',
            size: 'lg'
        });
    };
    
    ovs.getOvpTitle = function(){
        if(angular.isDefined(ovs.bds.copy)){

            let copyPhrase = ovs.bds.copy.archive_copy_id == null ? '' : ', Copy '+ovs.bds.copy.archive_copy_id;

            if(ovs.bds.copy.header){
                copyPhrase = ovs.bds.copy.header.filedesc.titlestmt.title['@reg']+copyPhrase
            }

            return copyPhrase;
        }
    };

    ovs.getPreviousObject = function(){

        let list = [];

        if(ovs.bds.work.bad_id == 'letters'){
            ovs.bds.copyObjects.forEach(function(obj){
                if(obj.object_group == ovs.bds.object.object_group){
                    list.push(obj);
                }
            })
        } else {
            list = ovs.bds.copyObjects;
        }

        let obj_desc_id = ovs.bds.object.supplemental ? ovs.bds.object.supplemental : ovs.bds.object.desc_id;

        if(list){
            for (let i = list.length; i--;) {
                if (list[i].desc_id == obj_desc_id) {
                    if (list[i - 1]) {
                        return list[i - 1];
                    } else {
                        return false;
                    }
                }
            }
        }
    };

    ovs.getNextObject = function(){

        let list = [];

        if(ovs.bds.work.bad_id == 'letters'){
            ovs.bds.copyObjects.forEach(function(obj){
                if(obj.object_group == ovs.bds.object.object_group){
                    list.push(obj);
                }
            })
        } else {
            list = ovs.bds.copyObjects;
        }

        let obj_desc_id = ovs.bds.object.supplemental ? ovs.bds.object.supplemental : ovs.bds.object.desc_id;

        if(list){
            for (let i = list.length; i--;) {
                if (list[i].desc_id == obj_desc_id) {
                    if(list[i + 1]){
                        return list[i + 1];
                    } else {
                        return false;
                    }
                }
            }
        }
    };

    ovs.toggleSupplemental = function(){
        $rootScope.supplemental = !$rootScope.supplemental;
    };

    ovs.changeObject = function(object){
        ovs.bds.changeObject(object);
    };

    return ovs;
});