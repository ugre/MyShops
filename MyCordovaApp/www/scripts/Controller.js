var Controller = function() {
    
    var controller = {
        self: null,
        template: null,
        initialize: function() {
            self = this;
            new SQLiteStorageService().done(function (service) {
                self.storageService = service;
                self.articleID = -1;
                self.markers = [];
                self.bindEvents();
            }).fail(function (error) {
                alert(error);
            })

        },

        bindEvents: function () {
            template = $('.article');

            $("#takePicture").click(this.takePicture);
            $("#pickPicture").click(this.pickPicture);
            
            $("#save").click(this.addArticle);
            $("#cancel").click(function () {                
                $.mobile.back();
                self.resetForm();
            });

            $(".addArticleButton").click(function () { self.articleID = -1; })
            $("#editArticleButton").click(function () {
                $.mobile.changePage("#new-item-tab");
            })
            $("#deleteArticleButton").click(function () {
                self.storageService.deleteArticle(self.articleID).done(function () {
                    window.plugins.toast.showShortBottom("Article successfully deleted!");
                    $("#popupMenu").popup("close");
                    self.loadArticles();
                    self.addMarkers();
                }).fail(function (error) {
                    alert(error);
                })
                self.articleID = -1;
            })
            $("#shareArticleButton").click(function () {
                window.plugins.socialsharing.shareViaFacebook('Message via Facebook', null /* img */, null /* url */, function ()
                { console.log('share ok') }, function (errormsg) { alert(errormsg) })
                self.articleID = -1;
            })

            $(".exitButton").click(function () {
                navigator.app.exitApp();
            })
            $(document).on("pagebeforeshow", "#list-tab", this.loadArticles);
            $(document).on("pagebeforeshow", "#new-item-tab", function () {
                if(self.articleID > -1)
                {
                    // Edit article
                    self.storageService.getArticle(self.articleID).done(function (article) {
                        
                        $('#articlename').val(article.name);
                        $('#shopname').val(article.shop);
                        $('#prise').val(article.prise);
                        $('#description').val(article.description);
                        $('#picture').attr('src', article.picture).show();

                        // adding events to buttons
                        $("#save").click(this.editArticle);
                        $(".locationLab").text("Update location?");

                    }).fail(function (error) {
                        alert(error);
                    });
                }
                else
                {
                    // New article
                    $(".locationLab").text("Include current location?");
                }
            });

            document.getElementById("btnMapFullScreen").addEventListener("click", mapFullScreen, false);
            document.getElementById("btnMapFindMe").addEventListener("click", mapFindMe, false);
            document.getElementById("btnMapTrackMe").addEventListener("click", mapTrackMe, false);

            document.getElementById("btnSettingsSave").addEventListener("click", settingsSave, false);

            //self.storageService.addArticle("Patike", "Forum", "5000", "Bele", "images/cordova.png", false);
        },

        takePicture: function () {
            navigator.camera.getPicture(cameraSuccess, cameraError, null);

            function cameraSuccess(imageData) {
                var image = document.getElementById('picture');
                image.src = imageData;
                $(image).show();
            }
            function cameraError(message) {
                alert(message);
            }
        },
        pickPicture: function () {
            navigator.camera.getPicture(cameraSuccess, cameraError, {
                quality: 50,
                destinationType: destinationType.FILE_URI,
                sourceType: source
            });

            function cameraSuccess(imageData) {
                var image = document.getElementById('picture');
                image.src = imageData;
                $(image).show();
            }
            function cameraError(message) {
                alert(message);
            }
        },

        loadArticles: function () {
                 
            var $tab = $('#articleList');
            $tab.empty();
            var $div = null;
            
            var articles = self.storageService.getArticles().done(function (articles) {

                //alert(articles.length);
                for (var idx in articles) {
                    $div = template.clone();
                    var article = articles[idx];

                    $div.find('.article-name').text(article.name);
                    $div.find('.article-shop').text(article.shop);
                    $div.find('.article-prise').text(article.prise + " Din");
                    $div.find('.article-desc').text(article.description);
                    $div.find('.article-picture').attr('src', article.picture);
                    $div.find('.options').attr('id', article.id).click(function () {           
                        self.articleID = $(this).attr('id');
                    });
                    
                    $tab.append($div);
                }
            }).fail(function (error) {
                alert(error);
            });
        },

        addArticle: function () {
            
            var name = $('#articlename').val();
            var description = $('#description').val();
            var prise = $('#prise').val().toString();
            var shop = $('#shopname').val();
            var picture = $('#picture').attr('src');
            var addLocation = $('#location').is(':checked');

            if (!name || !prise || !shop) {
                alert('Please fill in all fields');
                return;
            } else {

                if (self.articleID > -1) {
                    var result = self.storageService.editArticle(
                        self.articleID, name, shop, prise, description, picture, addLocation);

                    result.done(function () {
                        $.mobile.back();
                        self.resetForm();
                        window.plugins.toast.showShortBottom("Article successfully edited");
                        self.addMarkers();
                    }).fail(function (error) {
                        alert(error);
                    });
                }
                else {
                    var result = self.storageService.addArticle(
                        name, shop, prise, description, picture, addLocation);

                    result.done(function () {
                        $.mobile.back();
                        self.resetForm();
                        window.plugins.toast.showShortBottom("New article successfully added");
                        self.addMarkers();
                    }).fail(function (error) {
                        alert(error);
                    });
                }
            }
        },

        resetForm: function()
        {
            $("#editArticle")[0].reset();
            $('#picture').hide().attr('src', '');
            $("#description").val("");
            self.articleID = -1;
        },

        onMapReady: function()
        {
            map.setMapTypeId(plugin.google.maps.MapTypeId.HYBRID);
            self.addMarkers();
        },

        addMarkers: function()
        {
            self.markers = [];
            map.clear();
            map.off();
            pastMarker = null;
            mapFindMe();

            var articles = self.storageService.getArticles().done(function (articles) {

                //alert(articles.length);
                for (var idx in articles) {
                    var article = articles[idx];

                    if (article.location.latitude) {
                        map.addMarker({
                            'position': { lat: article.location.latitude, lng: article.location.longitude },
                            'title': article.name,
                            'snippet': article.shop,
                            'icon': 'blue',
                            'markerClick': function(marker)
                            {
                                marker.showInfoWindows();
                            },
                            'infoClick': function(marker)
                            {
                                clickedStoreLat = marker.get("position").lat;
                                clickedStoreLng = marker.get("position").lng;
                                clickedStoreTitle = marker.get("title");

                                dialogConfirm("Navigate to article " + marker.get("title"), "Navigation", ["YES", "SEND TO FRIEND", "NO"]);
                            }
                        }, function (marker) {
                            self.markers.push(marker);
                        });
                    }

                }
            }).fail(function (error) {
                alert(error);
            });
        }

    }
    controller.initialize();
    return controller;
}
