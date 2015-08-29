(function () {
    "use strict";

    // We were using Globalize 0.x, but we use so little of it that it isn't really worth updating to 1.x.
    // So we'll just recreate a very simplified version of the parts that we were using.
    var Globalize = (function() {
        var cultureInfoMap = {};
        return {
            addCultureInfo: function(cultureName, info) {
                cultureInfoMap[cultureName] = info;
            },
            localize: function(key, cultureSelector) {
                if (!cultureSelector) cultureSelector = 'en';

                var shortCultureSelector = cultureSelector.substring(0, 2);
                var cultureInfo = cultureInfoMap[shortCultureSelector] || cultureInfoMap['en'] || {};
                var messages = cultureInfo.messages || {};
                return messages[key];
            }
        };
    }());
    Globalize.addCultureInfo("en", {
        messages: {
            "title": "Agricola All Creatures Big and Small Scorecard",
            "shortTitle": "Agricola ACBAS Scorecard",
            "loading": "Loading",
            "details": "Details",
            "clear": "Clear"
        }
    });
    Globalize.addCultureInfo("fr", {
        name: "fr",
        language: "fr",
        messages: {
            "title": "Agricola Terres d'Élevage Scorecard",
            "shortTitle": "Agricola Terres d'Élevage Scorecard",
            "loading": "Chargement",
            "details": "Détails",
            "clear": "Nettoyer"
        }
    });
    Globalize.addCultureInfo("de", {
        name: "de",
        language: "de",
        messages: {
            "title": "Agricola Die Bauern und das liebe Vieh Scorecard",
            "shortTitle": "Agricola DBUDLV Scorecard",
            "loading": "Wird geladen",
            "details": "Details",
            "clear": "Löschen"
        }
    });

    var getPreferredLanguageCultureAsync = function () {
        var deferred = new Deferred();

        var defaultCultureName = 'en';

        // This should work on any modern browser probably?
        var resolveBrowserLanguage = function () {
            var cultureName = navigator.language || navigator.userLanguage;
            deferred.resolve(cultureName || defaultCultureName);
        }

        // This will only work in Cordova.
        var resolveOperatingSystemLanguage = function () {
            navigator.globalization.getPreferredLanguage(
              function (language) {
                  var cultureName;
                  if (language.value === "English") {
                      cultureName = 'en';
                  } else if (language.value === "German") {
                      cultureName = 'de';
                  } else if (language.value === "French") {
                      cultureName = 'fr';
                  }

                  deferred.resolve(cultureName || defaultCultureName);
              },
              function () {
                  resolveBrowserLanguage();
              }
            );
        };

        if (navigator && navigator.globalization && navigator.globalization.getPreferredLanguage) {
            resolveOperatingSystemLanguage();
        } else if (navigator) {
            resolveBrowserLanguage();
        } else {
            deferred.resolve(defaultCultureName);
        }
         
        return deferred.promise();
    };

    
    var createGameModel = function () {
        var throttleAmount = 300;

        var createScoreModelBase = function (category) {
            var s = {
                category: category,
                count: ko.observable().extend({ boundedInt: { min: category.min, max: category.max } })
            };



            s.decrement = function () {
                s.count(s.count() - 1);
            };
            s.isDecrementDisabled = ko.computed(function () {
                return s.count() <= category.min;
            }).extend({ throttle: throttleAmount });

            s.increment = function () {
                s.count(s.count() + 1);
            };
            s.isIncrementDisabled = ko.computed(function () {
                return s.count() >= category.max;
            }).extend({ throttle: throttleAmount });

            s.clear = function () {
                s.count(null);
            };
            return s;
        };

        var createCategory = function (id, iconName, createCategoryScoreModelCallback, options) {
            options = options || {};
            options.min = options.min || 0;
            options.max = options.max || 99;

            var category = {
                id: id,
                iconName: iconName,
                min: options.min,
                max: options.max
            };
            category.createScoreModel = function () {
                return createCategoryScoreModelCallback(category);
            };
            return category;
        };

        var createAnimalScoreModel = function (category, animalBonusLevels) {
            var s = createScoreModelBase(category);
            s.score = ko.computed(function () {
                var count = s.count();

                var bonus;
                if (count <= 3) {
                    bonus = -3;
                } else if (count <= animalBonusLevels.level0End) {
                    bonus = 0;
                } else if (count <= animalBonusLevels.level1End) {
                    bonus = 1;
                } else if (count <= animalBonusLevels.level2End) {
                    bonus = 2;
                } else {
                    bonus = 3 + (count - animalBonusLevels.level3);
                }

                return count + bonus;
            }).extend({ throttle: throttleAmount });
            return s;
        };
        var createMultiplierScoreModel = function (category, options) {
            options = options || {};
            options.scoreMultiplier = options.scoreMultiplier || 1;

            var s = createScoreModelBase(category);
            s.score = ko.computed(function () {
                return s.count() * options.scoreMultiplier;
            }).extend({ throttle: throttleAmount });
            return s;
        };

        var categories = [
            createCategory('sheepCount', 'sheep', function (category) {
                return createAnimalScoreModel(category, {
                    level0End: 7,
                    level1End: 10,
                    level2End: 12,
                    level3: 13
                });
            }),
            createCategory('pigCount', 'pig', function (category) {
                return createAnimalScoreModel(category, {
                    level0End: 6,
                    level1End: 8,
                    level2End: 10,
                    level3: 11
                });
            }),
            createCategory('cowCount', 'cow', function (category) {
                return createAnimalScoreModel(category, {
                    level0End: 5,
                    level1End: 7,
                    level2End: 9,
                    level3: 10
                });
            }),
            createCategory('horseCount', 'horse', function (category) {
                return createAnimalScoreModel(category, {
                    level0End: 4,
                    level1End: 6,
                    level2End: 8,
                    level3: 9
                });
            }),
            createCategory('completedExpansionCount', 'expansion',
                function (category) {
                    return createMultiplierScoreModel(category, { scoreMultiplier: 4 });
                },
                { max: 4 }
            ),
            createCategory('buildingScore', 'buildingscore', createMultiplierScoreModel)
        ];


        var createPlayerModel = function (color) {
            var p = {
                id: "player-" + color,
                color: color
            };

            var scoreModels = [];
            var scoreModelMap = {};
            _.map(categories, function (category) {
                var s = category.createScoreModel();
                scoreModels.push(s);
                scoreModelMap[category.id] = s;
            });

            p.getScoreModelForCategory = function (categoryId) {
                return scoreModelMap[categoryId];
            };

            p.scoreTotal = ko.computed(function () {
                var scoreTotal = 0;
                for (var i = 0; i < scoreModels.length; i++) {
                    var s = scoreModels[i];
                    scoreTotal += s.score();
                }
                return scoreTotal;
            });

            p.clear = function () {
                for (var i = 0; i < scoreModels.length; i++) {
                    var s = scoreModels[i];
                    s.clear();
                }
            };
            p.toJS = function () {
                var js = {};
                _.each(scoreModels, function (s) {
                    js[s.category.id] = s.count();
                });
                return js;
            };
            p.fromJS = function (js) {
                if (!js) {
                    p.clear();
                    return;
                }
                _.each(js, function (count, id) {
                    var s = p.getScoreModelForCategory(id);
                    if (s) {
                        s.count(count);
                    }
                });
            };

            return p;
        };

        var playerRed = createPlayerModel('red');
        var playerBlue = createPlayerModel('blue');
        var players = [playerRed, playerBlue];

        var gameModel = {
            players: players,
            categories: categories,
            isScoreDetailShown: ko.observable(false)
        };
        gameModel.toggleScoreDetailShown = function () {
            gameModel.isScoreDetailShown(!gameModel.isScoreDetailShown());
        };
        gameModel.clear = function () {
            for (var i = 0; i < gameModel.players.length; i++) {
                gameModel.players[i].clear();
            }
        };
        gameModel.toJS = function () {
            var js = {};
            js.playerRed = playerRed.toJS();
            js.playerBlue = playerBlue.toJS();
            return js;
        };
        gameModel.toJSON = function () {
            var js = gameModel.toJS();
            return JSON.stringify(js);
        };
        gameModel.fromJS = function (js) {
            if (!js) js = {};
            playerRed.fromJS(js.playerRed);
            playerBlue.fromJS(js.playerBlue);
        };

        gameModel.saveToLocalStorage = function () {
            if (!window.localStorage) {
                return;
            }
            var js = gameModel.toJS();
            var jsString = JSON.stringify(js);
            window.localStorage.setItem('agricola_2p.currentGame', jsString);
        };
        gameModel.loadFromLocalStorage = function () {
            if (!window.localStorage) {
                return;
            }

            try {
                var jsString = window.localStorage.getItem('agricola_2p.currentGame');
                var js = JSON.parse(jsString);
                if (typeof js === 'object' && js !== null) {
                    gameModel.fromJS(js);
                }
            } catch (e) {
                window.console && console.log(e);
            }
        };

        // Globalization
        gameModel.cultureName = ko.observable('default');
        gameModel.messages = {
            title: ko.computed(function () { return Globalize.localize('title', gameModel.cultureName()); }),
            shortTitle: ko.computed(function () { return Globalize.localize('shortTitle', gameModel.cultureName()); }),
            loading: ko.computed(function () { return Globalize.localize('loading', gameModel.cultureName()); }),
            details: ko.computed(function () { return Globalize.localize('details', gameModel.cultureName()); }),
            clear: ko.computed(function () { return Globalize.localize('clear', gameModel.cultureName()); }),
        };

        gameModel.isLoaded = ko.observable(false);

        return gameModel;
    };

    var initializePersistence = function (gameModel) {
        // Load the current game (if any) right at the start
        gameModel.loadFromLocalStorage();

        // Write to local storage when unloading the page
        //window.onbeforeunload = gameModel.saveToLocalStorage;
        window.onunload = gameModel.saveToLocalStorage;

        // For phonegap
        document.addEventListener("deviceready", function () {
            document.addEventListener("pause", gameModel.saveToLocalStorage, false);
        }, false);
    };

    var readyHandler = function () {
        var gameModel = createGameModel();
        getPreferredLanguageCultureAsync().done(function (cultureName) {
            if (cultureName) {
                gameModel.cultureName(cultureName);
            }
        });

        initializePersistence(gameModel);
        ko.applyBindings(gameModel);
        gameModel.isLoaded(true);
    };
    setTimeout(readyHandler);
})();