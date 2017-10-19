angular.module("blake")
.factory("worktitleService",function(BlakeDataService,$rootScope){
  let svc = {};
  svc.bds = BlakeDataService;

  svc.getFullTitle = function(){
    return svc.getWorkTitle()+" "+svc.getCopyPhrase()+" "+svc.getCompOrPrintDateString();
  }

  svc.getWorkTitle = function(){
    /* brazenly stolen from the workTitle directive's controller ... */
    if($rootScope.showWorkTitle == 'work'){
        return svc.bds.work.title;
    }

    /*COPY PAGES*/
    //For letters
    if(svc.bds.work.bad_id == 'letters'){
        if(svc.bds.object.object_group){
            title = svc.bds.object.object_group;
            title = title.match(/(to.*)/);
            return title[1].charAt(0).toUpperCase() + title[1].slice(1);
        }
    }
    //For Virtual Groups
    if(svc.bds.work.virtual){
        return svc.bds.work.title;
    }
    //For rest
    if(svc.bds.copy.header && $rootScope.doneSettingCopy){
        title = svc.bds.copy.header.filedesc.titlestmt.title.main['#text'];

    }
    if(title.match(/.*, The/)) {
        title = "The " + title.match(/(.*), The/)[1];
    }
    return title.trim();
  };

  svc.getCompOrPrintDateString = function() {
      if(svc.bds.work.probable == "printing")
          return "Printed " + svc.bds.copy.print_date_string;
      else
          return "Composed " + svc.bds.work.composition_date_string;
  }

  svc.getCopyPhrase = function() {
      if(svc.bds.work.virtual){
          return '';
      } else {
          return svc.bds.copy.archive_copy_id == null ? '' : 'Copy '+svc.bds.copy.archive_copy_id;
      }
  }


  svc.getCaptionFromGallery = function(){
    var caption = "";

    /*
    <span ng-if="svc.bds.work.virtual && svc.bds.copy.bad_id != 'letters'"><span>{{ svc.bds.object.title }}, </span><span class="object-no">Object {{ svc.bds.object.object_number }}, {{svc.bds.object.source.objdescid.compdate['#text']}}, {{svc.bds.object.source.repository.institution['#text']}}, </span></span>
    <span ng-if="svc.bds.work.virtual && svc.bds.copy.bad_id == 'letters'"><span>{{ svc.bds.object.title }}, </span><span class="object-no">Object {{ svc.bds.object.object_number }}, </span></span>
    */
    if (svc.bds.work.virtual){
      caption += svc.bds.object.title +", Object "+svc.bds.object.object_number;
      if (svc.bds.copy.bad_id != 'letters'){
        caption += ", "+svc.bds.object.source.objdescid.compdate['#text']+", "+svc.bds.object.source.repository.institution['#text'];
      }
    }else{
      /*<span class="object-no" ng-if="!svc.bds.work.virtual && !svc.bds.object.title">{{ svc.bds.object.full_object_id }}, </span>
      <span class="object-no" ng-if="!svc.bds.work.virtual && svc.bds.object.title && svc.bds.work.medium != 'exhibit'">{{svc.bds.object.title}}, {{ svc.bds.object.full_object_id }}, </span>
      <span class="object-no" ng-if="!svc.bds.work.virtual && svc.bds.object.title && svc.bds.work.medium == 'exhibit'">{{svc.bds.object.title}}</span>
      <span ng-if="svc.bds.work.medium != 'exhibit'">{{ svc.bds.object.physical_description.objsize['#text'] }} </span>
      */
      if (!svc.bds.object.title){
        caption += svc.bds.object.full_object_id;
      }else{
        if(svc.bds.work.medium != 'exhibit'){
          caption += svc.bds.object.title +", "+svc.bds.object.full_object_id;
        }else{
          caption += svc.bds.object.title;
        }

      }
      if (svc.bds.work.medium != 'exhibit'){
        caption += ", " + svc.bds.object.physical_description.objsize['#text'];
      }

    }
    /*<a ng-if="svc.bds.work.medium != 'exhibit'" style="color:#168bc1" ng-click="svc.ovs.userestrictOpen(svc.bds.copy,svc.bds.object)">&#169;</a>
    -- not adding cr to caption... ok?*/

    return caption;
  };

    svc.getCaptionFromReading = function(obj){
    var caption = "";

    /*
    <span ng-if="svc.bds.work.virtual && svc.bds.copy.bad_id != 'letters'"><span>{{ svc.bds.object.title }}, </span><span class="object-no">Object {{ svc.bds.object.object_number }}, {{svc.bds.object.source.objdescid.compdate['#text']}}, {{svc.bds.object.source.repository.institution['#text']}}, </span></span>
    <span ng-if="svc.bds.work.virtual && svc.bds.copy.bad_id == 'letters'"><span>{{ svc.bds.object.title }}, </span><span class="object-no">Object {{ svc.bds.object.object_number }}, </span></span>
    */
    if (svc.bds.work.virtual){
      caption += obj.title +", Object "+svc.bds.object.object_number;
      if (svc.bds.copy.bad_id != 'letters'){
        caption += ", "+obj.source.objdescid.compdate['#text']+", "+obj.source.repository.institution['#text'];
      }
    }else{
      /*<span class="object-no" ng-if="!svc.bds.work.virtual && !svc.bds.object.title">{{ svc.bds.object.full_object_id }}, </span>
      <span class="object-no" ng-if="!svc.bds.work.virtual && svc.bds.object.title && svc.bds.work.medium != 'exhibit'">{{svc.bds.object.title}}, {{ svc.bds.object.full_object_id }}, </span>
      <span class="object-no" ng-if="!svc.bds.work.virtual && svc.bds.object.title && svc.bds.work.medium == 'exhibit'">{{svc.bds.object.title}}</span>
      <span ng-if="svc.bds.work.medium != 'exhibit'">{{ svc.bds.object.physical_description.objsize['#text'] }} </span>
      */
      if (!obj.title){
        caption += obj.full_object_id;
      }else{
        if(svc.bds.work.medium != 'exhibit'){
          caption += obj.title +", "+obj.full_object_id;
        }else{
          caption += obj.title;
        }

      }
      if (svc.bds.work.medium != 'exhibit'){
        caption += ", " + obj.physical_description.objsize['#text'];
      }

    }

    /*<a ng-if="svc.bds.work.medium != 'exhibit'" style="color:#168bc1" ng-click="svc.ovs.userestrictOpen(svc.bds.copy,svc.bds.object)">&#169;</a>
    -- not adding cr to caption... ok?*/

    return caption;
  };

  return svc;
});
