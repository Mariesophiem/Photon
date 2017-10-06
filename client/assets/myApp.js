var app = angular.module("myApp", ['ngRoute', 'ngResource']);

app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

        $routeProvider
            .when('/', {
                templateUrl: "./static/views/vue1.html",
                controller: "myCtrl"
            })

            .when('/profil', {
                templateUrl: "./static/views/vue2.html",
                controller: "myCtrl2"
            })

            .otherwise({
                redirectTo: '/'
            });
    }
]);