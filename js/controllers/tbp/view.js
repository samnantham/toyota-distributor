'use strict';

app.controller('TBPInfoController', ['$scope', '$state', '$stateParams', 'webServices', 'utility', '$rootScope', '$timeout', '$filter', '$ngConfirm', '$sce', function($scope, $state, $stateParams, webServices, utility, $rootScope, $timeout, $filter, $ngConfirm, $sce) {

    $scope.tbp = {};
    $scope.filterData = {};
    $scope.tbp_uploads = angular.copy($rootScope.tbp_upload_types);

    $scope.getData = function() {
        webServices.get('tbp/' + $stateParams.id).then(function(getData) {
            $rootScope.loading = false;
            if (getData.status == 200) {
                $scope.tbp = getData.data;
                if(Object.keys($scope.tbp).length > 0){
                    $scope.tbp.videocount = $rootScope.getfileCounts($scope.tbp.tbp_files, 'video');
                    $scope.tbp.imagecount = $rootScope.getfileCounts($scope.tbp.tbp_files, 'image');
                    if($scope.tbp.uploads){
                        angular.forEach($scope.tbp_uploads, function(upload, no) {
                           upload.fileurl =  $scope.tbp.uploads[upload.typename];
                        });
                    }
                    console.log($scope.tbp)
                }else{
                    $state.go('app.tbps',{'type':1});
                }
            } else {
                $rootScope.$emit("showISError", getData);
            }
        });
    }

    $scope.uploadReport = function(type,files) {
        $scope.errors = [];
        if (files && files.length) {
            var extn = files[0].name.split(".").pop();
            if ($rootScope.validfileextensions.includes(extn.toLowerCase())) {
                if (files[0].size <= $rootScope.maxUploadsize) {
                    $scope.fileData = angular.copy($scope.tbp);
                    $scope.fileData.tbp = $stateParams.id;
                    $scope.fileData.newdocument = files[0];
                    $scope.fileData.type = type;
                    $scope.confirmUpload();
                } else {
                    $scope.errors.push(files[0].name + ' size exceeds 2MB.')
                }
            } else {
                $scope.errors.push(files[0].name + ' format unsupported.');
            }
        }
        if ($scope.errors.length > 0) {
            $rootScope.$emit("showErrors", $scope.errors);
        }
    }

    $scope.confirmUpload = function(){
        $ngConfirm({
            title: 'Are you sure want to upload this?',
            content: '',
            type: 'success',
            typeAnimated: true,
            buttons: {
                tryAgain: {
                    text: 'Yes',
                    btnClass: 'btn-red',
                    action: function() {
                        $scope.uploadDocument();
                    }
                },
                cancel: {
                    text: 'No',
                    action: function () {
                        $scope.fileData = {};
                        $scope.fileData.newdocument = '';
                    }
                }
            }
        });
    }

    $scope.uploadDocument = function(){
        webServices.upload('tbp/report/upload', $scope.fileData).then(function(getData) {
            $rootScope.loading = false;
            if (getData.status == 200) {
                $rootScope.$emit("showSuccessMsg", getData.data.message);
                $scope.fileData = {};
                $scope.fileData.newdocument = '';
                $scope.getData();
            } else {
                $rootScope.$emit("showISError", getData);
            }
        });
    };

    $scope.getData();

}]);