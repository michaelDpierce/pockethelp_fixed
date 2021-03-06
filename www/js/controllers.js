angular.module('ionicParseApp.controllers', [])

.controller('AppController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('welcome', {
            clear: true
        });
    };
})

.controller('WelcomeController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.login = function() {
        $state.go('app.login');
    };

    $scope.signUp = function() {
        $state.go('app.register');
    };

    if ($rootScope.isLoggedIn) {
        $state.go('app.home');
    }
})

.controller('HomeController', function($scope, $state, $rootScope, mapboxService) {
  mapboxService.init({ accessToken: 'pk.eyJ1IjoibWF0Y2htaWtlMTMxMyIsImEiOiJlNWIzMWZkMWMzMTVhMTU4ZTU5Njk1YzllNmZlZjIzYiJ9.o7ugJ1UbmcfDmDrl8i7l4Q' });

  if (!$rootScope.isLoggedIn) {
    $state.go('welcome');
  }

  var Help = Parse.Object.extend("Help");
  var help = new Parse.Query(Help);
  help.find({success:function(requests){
    $scope.help = requests
  }});

  $scope.driveTo = function(lat, long) {
    launchnavigator.navigate(
      [lat, long],
      null,
      function(){
        console.log("Plugin success");
      },
      function(error){
        console.log("Plugin error: "+ error);
      });
    }
})

.controller('ContactsController', function($scope, $state, $rootScope, $cordovaContacts, $ionicPlatform, $cordovaSms, $window) {
  var user = $scope.user;

  $scope.contacts = [
    {id: 1, objectId: user.attributes.contactOne},
    {id: 2, objectId: user.attributes.contactTwo},
  ]

  angular.element(document).ready(function () {
    getUsers();
  });

  $scope.sendSMS = function(contact) {
    var recipient = contact.phoneNumbers[0].value;
    $cordovaSms
      .send(recipient, 'Join me on PocketHelp! You can download on the Apple Store here: and the Play Store here: .', {})
      .then(function() {
        console.log('Success');
      }, function(error) {
        console.log('Error');
      });
  }

  getUsers = function() {
    $scope.users = [];
    var q2 = new Parse.Query(Parse.User);
    q2.find({success:function(users){
      _.forEach(users, function(user) {
        $scope.users.push({id: user.id, firstName: user.attributes.firstName, lastName: user.attributes.lastName, phone: user.attributes.phone});
      });
      console.log($scope.users);
      return $scope.users;
    }});
  }

  $scope.userLookup = function (userId) {
    userLookup = _.find($scope.users, { 'id': userId});
    return userLookup.firstName + ' ' + userLookup.lastName
  }

  $scope.isUser = function (contact) {
    if (contact.phoneNumbers[0].value) {
      var phoneNumber = contact.phoneNumbers[0].value;
      formattedPhone = phoneNumber.replace(/\D/g,'');
      userLookup = _.find($scope.users, { 'phone': formattedPhone});
      if (userLookup == undefined) { return false }
      else { return true }
    }
    else {
      return false
    }
  }

  $scope.addPocketHelper = function (contact) {
    var user = $scope.user;

    var phoneNumber = contact.phoneNumbers[0].value;
    formattedPhone = phoneNumber.replace(/\D/g,'');
    userLookup = _.find($scope.users, { 'phone': formattedPhone});

    if (!user.attributes.contactOne) {
      user.set("contactOne",userLookup.id);
      user.save()
      .then(
        function(user) {
          return user.fetch();
          Parse.User.logIn(user.email, user.password);
          Parse.User.current().fetch()
          $scope.contacts = [
            {id: 1, objectId: user.attributes.contactOne},
            {id: 2, objectId: user.attributes.contactTwo},
          ]
        }
      )
      .then(
        function(user) {
          console.log('User Updated', user);
          $window.location.reload();
        },
        function(error) {
          console.log('Something went wrong', error);
        }
      );
    }
    else if (!user.attributes.contactTwo) {
      user.set("contactTwo",userLookup.id);
      user.save()
      .then(
        function(user) {
          return user.fetch();
          Parse.User.logIn(user.email, user.password);
          Parse.User.current().fetch()
          $scope.contacts = [
            {id: 1, objectId: user.attributes.contactOne},
            {id: 2, objectId: user.attributes.contactTwo},
          ]
        }
      )
      .then(
        function(user) {
          console.log('User Updated', user);
          $window.location.reload();
        },
        function(error) {
          console.log('Something went wrong', error);
        }
      );
    }
    else {
      alert('All slots are taken. Please purchase additional slots to add more PocketHelpers.');
    }
  }

  $scope.removePocketHelper = function(contact) {
    if (contact.id == 1) {
      user.set("contactOne", '');
      user.save()
      .then(
        function(user) {
          return user.fetch();
          Parse.User.logIn(user.email, user.password);
          Parse.User.current().fetch()
          $scope.contacts = [
            {id: 1, objectId: user.attributes.contactOne},
            {id: 2, objectId: user.attributes.contactTwo},
          ]
        }
      )
      .then(
        function(user) {
          console.log('User Updated', user);
          $window.location.reload();
        },
        function(error) {
          console.log('Something went wrong', error);
        }
      );
    }
    else if (contact.id == 2) {
      user.set("contactTwo", '');
      user.save()
      .then(
        function(user) {
          return user.fetch();
          Parse.User.logIn(user.email, user.password);
          Parse.User.current().fetch()
          $scope.contacts = [
            {id: 1, objectId: user.attributes.contactOne},
            {id: 2, objectId: user.attributes.contactTwo},
          ]
        }
      )
      .then(
        function(user) {
          console.log('User Updated', user);
          $window.location.reload();
        },
        function(error) {
          console.log('Something went wrong', error);
        }
      );
    }
  }

  $scope.getContacts = function() {
    $scope.phoneContacts = [];

    function onSuccess(contacts) {
      for (var i = 0; i < contacts.length; i++) {
        var contact = contacts[i];
        $scope.phoneContacts.push({name: contact.name.formatted, phoneNumbers: contact.phoneNumbers});
      }
    };

    function onError(contactError) {
      alert(contactError);
    };

    var options = {};
    options.multiple = true;

    $cordovaContacts.find(options).then(onSuccess, onError);
  };
})

.controller('HelpController', function($scope, $state, $rootScope, $ionicPlatform, $cordovaGeolocation) {
  var user = $scope.user;

  var lat = null;
  var long = null;

  $scope.currentLocation = function () {
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        lat  = position.coords.latitude
        long = position.coords.longitude
      }, function(err) {
        console.log('Error');
      });
  };

  $scope.requestHelp = function (helpData) {
    var Help = Parse.Object.extend("Help");
    var help = new Help();

    help.save({issue: helpData.issue, level: helpData.level, user_id: user.id, latitude: lat, longitude: long}, {
      success: function(object) {
        alert("yay! it worked");
      }
   });
  }
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading) {
    $scope.user = {
        username: null,
        password: null
    };

    $scope.error = {};

    $scope.login = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = $scope.user;
        Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, err) {
                $ionicLoading.hide();
                // The login failed. Check error to see why.
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
    };

    $scope.forgot = function() {
        $state.go('app.forgot');
    };

    $scope.signUp = function() {
        $state.go('app.register');
    };
})

.controller('ForgotPasswordController', function($scope, $state, $ionicLoading) {
    $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
                $ionicLoading.hide();
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('app.login');
    };
})

.controller('RegisterController', function($scope, $state, $ionicLoading, $rootScope) {
    $scope.user = {};
    $scope.error = {};

    $scope.login = function() {
        $state.go('app.login');
    };

    $scope.register = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = new Parse.User();
        user.set("username", $scope.user.email);
        user.set("password", $scope.user.password);
        user.set("email", $scope.user.email);

        user.signUp(null, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                } else if (error.code === 202) {
                    $scope.error.message = 'The email address is already ' +
                        'registered';
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
        });
    };
})

.controller('MainController', function($scope, $state, $rootScope, $stateParams, $ionicHistory) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
    }

    $scope.rightButtons = [{
        type: 'button-positive',
        content: '<i class="icon ion-navicon"></i>',
        tap: function(e) {
            $scope.sideMenuController.toggleRight();
        }
    }];

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('welcome', {
            clear: true
        });
    };

    $scope.toggleMenu = function() {
        $scope.sideMenuController.toggleRight();
    };
});
