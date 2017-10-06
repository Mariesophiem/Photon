app.controller("myCtrl", function($scope) {

	$scope.socket = [];
   	socket.on("emission", function (socket) {
        console.log("socket");
        $scope.socket.push(socket);
        $scope.$apply();
   })

});