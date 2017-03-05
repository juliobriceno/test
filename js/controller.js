angular.element(function() {
    angular.bootstrap(document, ['Solicitudes']);
});

angular.module('Solicitudes', ['angularFileUpload', 'darthwade.loading', 'ngTagsInput', 'ngAnimate', 'ngSanitize', 'ui.bootstrap'])

        .controller('ctrlUploadFile', ['$scope', '$http', 'FileUploader', '$loading', function ($scope, $http, FileUploader, $loading) {
            $scope.regPasswordRepeat = '';
            $scope.States = [{ name: 'Amazonas' }, { name: 'Anzo\341tegui' }, { name: 'Apure' }, { name: 'Aragua' }, { name: 'Barinas' }, { name: 'Bol\355var' }, { name: 'Carabobo' }, { name: 'Cojedes' }, { name: 'Delta Amacuro' }, { name: 'Distrito Capital' }, { name: 'Falc\363n' }, { name: 'Gu\341rico' }, { name: 'Lara' }, { name: 'M\351rida' }, { name: 'Miranda' }, { name: 'Monagas' }, { name: 'Nueva Esparta' }, { name: 'Portuguesa' }, { name: 'Sucre' }, { name: 'T\341chira' }, { name: 'Trujillo' }, { name: 'Vargas' }, { name: 'Yaracuy' }, { name: 'Zulia' }];
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
                if (response.Result == 'nc') {
                    window.location.href = '/login.html';
                    return 0;
                }
                if (response.Result == 'nd') {
                    swal("Mensaje de App de Inventario", "Tu archivo no tiene data!!!");
                    return 0;
                }
                if (response.Result == 'nt') {
                    swal("Mensaje de App de Inventario", "Tu archivo no es ni txt ni csv!!!");
                    return 0;
                }
                if (response.Result == 'ns') {
                    swal("Mensaje de App de Inventario", "Tu archivo es muy grande!!!");
                    return 0;
                }
                if (response.Result == 'nx') {
                    $scope.Products = response.Products;
                    swal("Mensaje de App de Inventario", "No se pudo importar. Detalles en la tabla!!!");
                    return 0;
                }
                $scope.Products = response.Products;
                $scope.uploader.clearQueue();
                swal("Mensaje de App de Inventario", "Se cargaron todos tus productos ya!!!!!.");
            };
            $scope.CloseSession = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/closeSession',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    if (response.data.result == 'Ok') {
                        window.location.href = '/';
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetUserData = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/getUserData',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    if (response.data.Result == 'nc') {
                        window.location.href = '/login.html';
                        return 0;
                    }
                    else {
                        $scope.ActiveUser = response.data.Email;
                        $scope.regEnterprise = response.data.Enterprise;
                        $scope.regPhone = response.data.Phone;
                        $scope.selectedState = $scope.States.filter(function (el) { return el.name == response.data.State })[0];
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.updateUserData = function () {
                if ($scope.regEnterprise.trim() == '') {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un nombre de empresa.");
                    return 0;
                }
                $loading.start('myloading');
                var Data = {};
                Data.Enterprise = $scope.regEnterprise;
                Data.State = $scope.selectedState.name;
                Data.Phone = $scope.regPhone;
                $http({
                    method: 'POST',
                    url: '/updateUserData',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    if (response.data.Result == 'nc') {
                        window.location.href = '/login.html';
                        return 0;
                    }
                    else {
                        if (response.data.Result == 'Ok') {
                            swal("Mensaje de la aplicacion de recibos", "Tus datos fueron actualizados.");
                        };
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.updatePassword = function () {
                if ($scope.regPassword.trim() != $scope.regPasswordRepeat.trim()) {
                    swal("Mensaje de la aplicacion de recibos", "Password y repetición no coincide.");
                    return 0;
                }
                $loading.start('myloading');
                var Data = {};
                Data.Password = $scope.regPassword;
                $http({
                    method: 'POST',
                    url: '/updatePassword',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    if (response.data.Result == 'nc') {
                        window.location.href = '/login.html';
                        return 0;
                    }
                    else {
                        if (response.data.Result == 'Ok') {
                            swal("Mensaje de la aplicacion de recibos", "Tu contraseña fue actualizada.");
                        };
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetUserData();
        }])

        .controller('ctrlProducts', ['$scope', '$http', 'FileUploader', '$loading', function ($scope, $http, FileUploader, $loading) {
            $scope.showFinder = false;
            $scope.NewFind = function () {
                $scope.txtFind = undefined;
                $scope.txtFind = '';
                $scope.States = [];
                $scope.Makes = [];
                $scope.Models = [];
                $scope.Products = [];
                $scope.Orders = [{ "text": "Menor a Mayor Precio", name: 'Precio', dir: 'asc' }, { "text": "Mayor a Menor Cantidad", name: 'Cantidad', dir: 'desc' }];
                $scope.chkNew = true;
                $scope.chkUsed = true;
            }
            $scope.loadOrders = function (query) {
                var Orders = [];
                Orders = [{ "text": "Menor a Mayor Precio", name: 'Precio', dir: 'asc' }, { "text": "Mayor a Menor Cantidad", name: 'Cantidad', dir: 'desc' }, { "text": "Menor a Mayor Cantidad", name: 'Cantidad', dir: 'asc' }, { "text": "Mayor a Menor Precio", name: 'Precio', dir: 'desc' }];
                Orders = Orders.filter(function (el) {
                    return (el.text.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return Orders;
            };
            $scope.loadStates = function (query) {
                var States = [];
                States = $scope.ProductStates;
                States = States.filter(function (el) {
                    return (el.State.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return States;
            };
            $scope.loadMakes = function (query) {
                var Makes = [];
                Makes = $scope.ProductMakes;
                Makes = Makes.filter(function (el) {
                    return (el.Marca.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return Makes;
            };
            $scope.loadModels = function (query) {
                var Models = [];
                Models = $scope.ProductModels;
                Models = Models.filter(function (el) {
                    return (el.Modelo.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return Models;
            };
            $scope.forceOneTag = function forceOneTag() {
                return ($scope.States.length == 0);
            }
            $scope.GetProducts = function () {
                var txtFind = '';
                if (typeof ($scope.txtFind) == 'object') {
                    txtFind = $scope.txtFind._id;
                }
                else {
                    txtFind = $scope.txtFind;
                }
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/GetProducts',
                    headers: { 'Content-Type': 'application/json' },
                    data: { Nombre: txtFind }
                }).then(function successCallback(response) {
                    $scope.NewFind();
                    $scope.showFinder = true;
                    $scope.Products = response.data.Products;
                    $scope.ProductsAll = $scope.Products;
                    $scope.ProductMakes = _.uniqBy($scope.Products, 'Marca');
                    $scope.ProductStates = _.uniqBy($scope.Products, 'State');
                    $scope.ProductModels = _.uniqBy($scope.Products, 'Modelo');
                    console.log($scope.ProductMakes);
                    console.log($scope.ProductModels);
                    $scope.FilterProduct();
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetSuggestProducts = function () {
                $scope.NewFind();
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/GetSuggestProducts',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    $scope.txtProducts = response.data.SuggestProducts;
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetSuggestProducts();
            $scope.tagAdded = function (tag) {
                $scope.FilterProduct();
            };
            $scope.FilterProduct = function () {
                var FinalResult = [];
                if ($scope.Makes.length > 0) {
                    var result = [];
                    _.forEach($scope.ProductsAll, function (n, key) {
                        _.forEach($scope.Makes, function (n2, key2) {
                            if (n.Marca === n2.Marca) {
                                result.push(n);
                            }
                        });
                    });
                    FinalResult = result;
                }
                else {
                    FinalResult = $scope.ProductsAll;
                }
                if ($scope.Models.length > 0) {
                    var result = [];
                    _.forEach(FinalResult, function (n, key) {
                        _.forEach($scope.Models, function (n2, key2) {
                            if (n.Modelo === n2.Modelo) {
                                result.push(n);
                            }
                        });
                    });
                    FinalResult = result;
                }
                if ($scope.States.length > 0) {
                    var result = [];
                    _.forEach(FinalResult, function (n, key) {
                        _.forEach($scope.States, function (n2, key2) {
                            if (n.State === n2.State) {
                                result.push(n);
                            }
                        });
                    });
                    FinalResult = result;
                }
                if ($scope.chkNew != $scope.chkUsed) {
                    if ($scope.chkNew == true) {
                        FinalResult = FinalResult.filter(function (el) {
                            return el.Estado == 'Nuevo';
                        })
                    }
                    else {
                        FinalResult = FinalResult.filter(function (el) {
                            return el.Estado == 'Usado';
                        })
                    }
                }
                var OrderByValue = [];
                var OrderByDirection = [];
                _.forEach($scope.Orders, function (n2, key2) {
                    OrderByValue.push(n2.name);
                    OrderByDirection.push(n2.dir);
                });
                if (OrderByValue.length == 0)
                {
                    OrderByValue = ['Precio', 'Cantidad'];
                    OrderByDirection = ['asc', 'desc'];
                }
                FinalResult = _.orderBy(FinalResult, OrderByValue, OrderByDirection);
                $scope.Products = FinalResult;
            }
        }])

        .controller('ctrlLogin', ['$scope', '$http', '$loading', function ($scope, $http, $loading) {
            $scope.showlogin = true;
            $scope.logEmail = 'julio.briceno@gmail.com';
            $scope.logPassword = '0dcMr';
            $scope.regEmail = '';
            $scope.regPhone = '';
            $scope.regEnterprise = '';
            $scope.ForgotPassword = function () {
                if ($scope.ValidateEmail($scope.logEmail) == false) {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un correo valido.");
                    return 0;
                }
                var Data = {};
                Data.Email = $scope.logEmail;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/RecoverPassword',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.result == 'Ok') {
                        swal("Mensaje de la aplicacion de recibos", "Una nueva clave fue generada y enviada a tu correo electrónico.");
                    }
                    else {
                        swal("Mensaje de la aplicacion de recibos", "Clave invalida.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.States = [{ name: 'Amazonas' }, { name: 'Anzo\341tegui' }, { name: 'Apure' }, { name: 'Aragua' }, { name: 'Barinas' }, { name: 'Bol\355var' }, { name: 'Carabobo' }, { name: 'Cojedes' }, { name: 'Delta Amacuro' }, { name: 'Distrito Capital' }, { name: 'Falc\363n' }, { name: 'Gu\341rico' }, { name: 'Lara' }, { name: 'M\351rida' }, { name: 'Miranda' }, { name: 'Monagas' }, { name: 'Nueva Esparta' }, { name: 'Portuguesa' }, { name: 'Sucre' }, { name: 'T\341chira' }, { name: 'Trujillo' }, { name: 'Vargas' }, { name: 'Yaracuy' }, { name: 'Zulia' }];
            $scope.Registration = function () {
                if ($scope.ValidateEmail($scope.regEmail) == false) {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un correo valido.");
                    return 0;
                }
                if (typeof $scope.selectedState == 'undefined') {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un Estado.");
                    return 0;
                }
                if ($scope.regEnterprise.trim() == '') {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un nombre de empresa.");
                    return 0;
                }
                var Data = {};
                Data.Email = $scope.regEmail;
                Data.Phone = $scope.regPhone;
                Data.Enterprise = $scope.regEnterprise;
                Data.State = $scope.selectedState.name;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/Registration',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'Ok') {
                        swal("Mensaje de la aplicacion de recibos", "Tu cuenta fue creada. Te hemos enviado un correo con datos de acceso.");
                    }
                    else {
                        swal("Mensaje de la aplicacion de recibos", "Clave invalida.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.Login = function () {
                if ($scope.ValidateEmail($scope.logEmail) == false) {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un correo valido.");
                    return 0;
                }
                if ($scope.logPassword.trim() == '') {
                    swal("Mensaje de la aplicacion de recibos", "Coloca un password.");
                    return 0;
                }
                $loading.start('myloading');
                var Data = {};
                Data.Email = $scope.logEmail;
                Data.Password = $scope.logPassword;
                $http({
                    method: 'POST',
                    url: '/Login',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Login == true) {
                        window.location.href = '/uploadfile.html';
                    }
                    else {
                        swal("Mensaje de la aplicacion de recibos", "Clave invalida.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.ValidateEmail = function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }
        }])