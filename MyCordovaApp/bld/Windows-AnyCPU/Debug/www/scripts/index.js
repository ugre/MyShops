var controller;
var app = {
    // Application Constructor
    initialize: function() {
        
            this.onDeviceReady();
    },

    onDeviceReady: function() {
        controller = new Controller();
        app.overrideBrowserAlert();
    },

    overrideBrowserAlert: function() {
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.alert = function (message) {
                navigator.notification.alert(
                    message,    // message
                    null,       // callback
                    "Toptal", // title
                    'OK'        // buttonName
                );
            };
        }
    },

};

app.initialize();
