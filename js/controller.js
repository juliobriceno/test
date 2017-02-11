angular.element(function() {
    angular.bootstrap(document, ['Solicitudes']);
});

angular.module('Solicitudes', ['angularFileUpload', 'darthwade.loading'])

        .controller('MyController3', ['$scope', '$http', 'FileUploader', '$loading', function ($scope, $http, FileUploader, $loading) {
            $scope.Usuario = 'admin@gmail.com';
            $scope.Contrasena = '123';
            $scope.Login = function () {
                if ($scope.Usuario.trim() == '' || $scope.Contrasena.trim() == '') {return};
                var Data = {};
                Data.Usuario = $scope.Usuario;
                Data.Contrasena = $scope.Contrasena;
                $http({
                    method: 'POST',
                    url: '/Login',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    if (response.data.Login == true) {
                        swal("Se conectó", "Se conectó.");
                    }
                    else {
                        swal("Mensaje de la aplicacion de recibos", "Clave invalida.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.uploader = new FileUploader();
            $scope.uploader.url = "/upload";
            $scope.uploader.onBeforeUploadItem = function (item) {
                $loading.start('myloading');
            };
            $scope.uploader.onAfterAddingFile = function (item /*{File|FileLikeObject}*/, filter, options) {
                $scope.uploader.uploadAll();
            };
            $scope.uploader.onSuccessItem = function (item, response) {
                $loading.finish('myloading');
                $scope.Productos = response.Productos;
                swal("Mensaje de App de Inventario", "Se cargaron todos tus productos ya!!!!!.");
            };
        }])
