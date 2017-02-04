angular.element(function() {
    angular.bootstrap(document, ['Solicitudes']);
});

angular.module('Solicitudes', ['darthwade.loading'])

        .controller('MyController3', ['$scope', '$http', function ($scope, $http) {
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
        }])

