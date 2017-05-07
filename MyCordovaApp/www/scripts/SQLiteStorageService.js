SQLiteStorageService = function () {
	var service = {};
	var db = window.sqlitePlugin.openDatabase({name: "demo.db", location: 'default'});

    service.initialize = function() {
        
        var deferred = $.Deferred();
        db.transaction(function(tx) {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS articles ' + 
                '(id integer primary key, name text, shop text, prise text, description text, picture text, latitude real, longitude real)'
            ,[],  function(tx, res) {
                deferred.resolve(service);
            });
        });
        return deferred.promise();
    }

    service.getArticles = function() {
    	var deferred = $.Deferred();

        db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM articles', [], function(tx, res) {

                var articles = [];
                for(var i = 0; i < res.rows.length; i++) {
                    var article = {id: res.rows.item(i).id, name: res.rows.item(i).name, shop: res.rows.item(i).shop, prise: res.rows.item(i).prise, description: res.rows.item(i).description, picture: res.rows.item(i).picture };
                    if (res.rows.item(i).latitude && res.rows.item(i).longitude) {
                        article.location = {
                            latitude: res.rows.item(i).latitude,
                            longitude: res.rows.item(i).longitude
                        }
                    } 
                    articles.push(article);
                }
                deferred.resolve(articles);

            }, function(e) {
                deferred.reject(e);
            });
        });
        return deferred.promise();
    }

    service.addArticle = function(name, shop, prise, description, picture, addLocation) {
        var deferred = $.Deferred();

        if (addLocation) {
            navigator.geolocation.getCurrentPosition (
                function(position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;
                   
                    db.transaction(
                    	function(tx) {
                            tx.executeSql('INSERT INTO articles (name, shop, prise, description, picture, latitude, longitude) VALUES (?,?,?,?,?,?,?)', 
                                [name, shop, prise, description, picture, lat, lon], 
                                function(tx, res) 
                            {
                                console.log('success');
                                deferred.resolve();
                            }, function(e) 
                            {
                                console.log('failure');
                                deferred.reject('Error posting a new article');
                            });
                        },
                        function() {
                            deferred.reject('Error during save process. ');
                        }
                    );
                },
                function() {
                    deferred.reject(
                            'We could not fetch your current location. ' + 
                            'Please try again or add a article without a location');
                },
                {maximumAge: 60000, timeout: 5000, enableHighAccuracy: true}
            );
        } else {
            db.transaction(function(tx) {
                tx.executeSql('INSERT INTO articles (name, shop, prise, description, picture) VALUES (?,?,?,?,?)', [name, shop, prise, description, picture], function(tx, res) {
                    deferred.resolve();
                }, function(e) {
                    deferred.reject(e);
                });
            });
        }
        return deferred.promise();
    }

    service.getArticle = function(id)
    {
        var deferred = $.Deferred();

        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM articles WHERE id=?', [id], function (tx, res) {

                for (var i = 0; i < res.rows.length; i++) {
                    var article = { name: res.rows.item(i).name, shop: res.rows.item(i).shop, prise: res.rows.item(i).prise, description: res.rows.item(i).description, picture: res.rows.item(i).picture };
                    if (res.rows.item(i).latitude && res.rows.item(i).longitude) {
                        article.location = {
                            latitude: res.rows.item(i).latitude,
                            longitude: res.rows.item(i).longitude
                        }
                    }
                    deferred.resolve(article);
                }                

            }, function (e) {
                deferred.reject(e);
            });
        });
        return deferred.promise();
    }

    service.editArticle = function(id, name, shop, prise, description, picture, addLocation)
    {
        var deferred = $.Deferred();

        if (addLocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;

                    db.transaction(
                    	function (tx) {
                    	    tx.executeSql('UPDATE articles SET name=?,shop=?,prise=?,description=?,picture=?,latitude=?,longitude=? WHERE id=?', [name, shop, prise, description, picture, lat, lon, id],
                                function (tx, res) {
                                    console.log('success');
                                    deferred.resolve();
                                }, function (e) {
                                    console.log('failure');
                                    deferred.reject('Error posting a new article');
                                });
                    	},
                        function () {
                            deferred.reject('Error during save process. ');
                        }
                    );
                },
                function () {
                    deferred.reject(
                            'We could not fetch your current location. ' +
                            'Please try again or add a article without a location');
                },
                { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
            );
        } else {
            db.transaction(function (tx) {
                tx.executeSql('UPDATE articles SET name=?,shop=?,prise=?,description=?,picture=? WHERE id=?', [name, shop, prise, description, picture, id], function (tx, res) {
                    deferred.resolve();
                }, function (e) {
                    deferred.reject(e);
                });
            });
        }
        return deferred.promise();
    }

    service.deleteArticle = function(id)
    {
        var deferred = $.Deferred();

        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM articles WHERE id=?', [id], function (tx, res) {

                deferred.resolve();

            }, function (e) {
                deferred.reject(e);
            });
        });
        return deferred.promise();
    }

    return service.initialize();
}
