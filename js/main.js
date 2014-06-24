//CrimBook with sqlite backend
var myData,
    State,
    History = window.History,
    db,
    dbName = 'CrimLaws',
    latestDbVersion = '1.0', //Change this on update
//Change content depending on state
updateContent = function(State,callback) {
    var target = State.data.id,
        view = State.data.type,
        pos = State.data.pos,
        items,
        laws,
        loc = window.location.toString().queryStringToJSON();

    //Ensure that any alert messages are hidden
    $('.alert').hide();

    //Clear the search term
    if (loc.view === 'search'){
        $('input').val(loc.target);
    } else {
        $('input').val('');
    }

    switch (view) {
    case 'list':
        items = ' <div class="list-group display-rows">';
        laws = jlinq.from(myData).starts('sortcode', target + ' ').select();
        for (var i = 0, l = laws.length; i < l; i ++) {
            items += '<a class="law-link list-group-item" href="#" data-id="' + laws[i].id + '">' + laws[i].title + ' ' + laws[i].description + '</a>';
        }
        items += '</div>';
        $('.panel').html(items);
        $(document).scrollTop(pos);
        break;
    case 'law':
        laws = jlinq.from(myData).equals('id', target).select();
        //check to see if this law has been favorited
        var fav;
        if (localStorage.getItem(target)){
            fav = '<a href="#" class="favorite upper-right-corner" data-state="saved" data-id="' + target +
            '" title="Favorite This"><span class="glyphicon glyphicon-star"></span></a>';
        }
        else {
            fav = '<a href="#" class="favorite upper-right-corner" data-state="unsaved" data-id="' + target +
            '" title="Favorite This"><span class="glyphicon glyphicon-star-empty"></span></a>';
        }
        $('title').text(laws[0].description + ' ' + laws[0].title);
        $('.panel').css({'padding':'10px'}).html('<h3><span class="lawTitle">' + laws[0].description + '</span>' + fav + '</h3>' + laws[0].law_text);
        $(document).scrollTop(0);
        break;
    case 'search':
        var regex = new RegExp('\\b' + target + '\\b');
        console.timeStamp('querying jlinq');
        //Too slow 7s on mobile
        laws = jlinq.from(myData).match('law_text', regex).or().match('title', regex).select();
        //Faster 5s
        //laws = jlinq.from(myData).contains('law_text', target).or().contains('title', target).select();
        //Fastest 2s
        //laws = jlinq.from(myData).contains('law_text', target).select();
        console.timeStamp('starting items object');
        items = '<div class="list-group">';
        if (!laws.length){
            items += '<a class="list-group-item">No results found.</a>';
        } else {
            for (i = 0, l = laws.length; i < l; i ++) {
                var snippet = getExcerpt(laws[i].law_text, target, 15);
                if (snippet){
                    items += '<a class="law-link list-group-item" href="#" data-id="' + laws[i].id +
                    '">' + laws[i].title + ' ' + laws[i].description +
                    '<p class="preview">...' + snippet + '...</p>' + '</a>' ;
                } else {
                    items += '<a class="law-link list-group-item" href="#" data-id="' + laws[i].id +
                    '">' + laws[i].title + ' ' + laws[i].description + '</a>' ;
                }
            }
        }
        items += '</div>';
        console.markTimeline('items object finished');
        $('.panel').html(items);
        $(document).scrollTop(pos);
        break;
    case 'favorites':
        items = ' <div class="list-group display-rows">';
        if (localStorage.length > 0) {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                laws = jlinq.from(myData).equals('id', key).select();
                items += '<a class="law-link list-group-item" href="#" data-id="' + laws[0].id + '">' + laws[0].description +
                ' ' + laws[0].title + '</a>';
            }
        }
        else {
            items += '<a class="list-group-item">You don\'t have any favorited laws</a>';
        }

        items += '</div>';
        $('.panel').html(items);
        $(document).scrollTop(pos);
        break;
    default:
        var menu = ' <div class="list-group"> <a class="nav-link list-group-item list-group-item " data-id="RS 000014" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Title 14</a> <a class="nav-link list-group-item" data-id="RS 000015" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Title 15</a> <a class="nav-link list-group-item" data-id="RS 000032" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Title 32</a> <a class="nav-link list-group-item" data-id="RS 000040" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Title 40</a> <a class="nav-link list-group-item" data-id="RS 000046" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Title 46</a> <a class="nav-link list-group-item" data-id="RS 000056" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Title 56</a> <a class="nav-link list-group-item" data-id="CCRP" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Code of Criminal Procedure </a> <a class="nav-link list-group-item" data-id="CE" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Code of Evidence </a> <a class="nav-link list-group-item" data-id="CHC" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Childrens Code</a> <a class="nav-link list-group-item" data-id="CONST" href="#">' +
        '<span class="glyphicon glyphicon-chevron-right"></i> Constitution</a> </div>';
        $('.panel').html(menu);
        $(document).scrollTop(pos);
    }
    callback();
},

setCurrentPosition = function () {
    var currentView = window.location.toString().queryStringToJSON();
    var scroll = $(document).scrollTop();
    History.replaceState({type: currentView.view, id: currentView.target, pos: scroll}, currentView.target, '?target=' + currentView.target + '&view=' + currentView.view);
},

updateFavoritesList = function () {
    if (localStorage.length > 0) {
        var favList = '',
        key,
        value,
        i;

        if (localStorage.length > 4) {
            for (i = 0; i < 5; i++) {
                key = localStorage.key(i);
                value = localStorage.getItem(key);
                favList += '<li><a class="fav-link" href="#" data-id="' + key + '">' + value + '</a></li>';
            }
            favList += '<li class="divider"></li><li><a class="fav-all" href="#">View All</a></li>';
        }
        else {
            for (i = 0; i < localStorage.length; i++) {
                key = localStorage.key(i);
                value = localStorage.getItem(key);
                favList += '<li><a class="fav-link" href="#" data-id="' + key + '">' + value + '</a></li>';
            }
        }

        $('.dropdown-menu').html(favList);
    }
},

init = function () {
    //Handle History
    History.Adapter.bind(window, 'statechange', function () {
        if (typeof spinnerplugin !== 'undefined'){
            spinnerplugin.show({overlay: false, fullscreen: false});
        }
        updateContent(History.getState(), function () {
            updateFavoritesList();
            if (typeof spinnerplugin !== 'undefined'){
                spinnerplugin.hide();
            }
        });
    });

    //Handle clicks
    $('.main').on('click', 'a.nav-link', function (event) {
        event.preventDefault();
        var target = $(this).attr('data-id');
        var scroll = $(document).scrollTop();
        History.pushState({type: 'list', id: target}, target, '?target=' + target + '&view=list');
    });

    $('.main').on('click', 'a.law-link', function (event) {
        event.preventDefault();
        setCurrentPosition();
        var target = $(this).attr('data-id');
        History.pushState({type: 'law', id: target}, target, '?target=' + target + '&view=law');
    });

    $('.search-btn').click(function (event) {
        event.preventDefault();
        var target = $(this).prev().val();
        $(document).scrollTop('0');
        History.pushState({type: 'search', id: target}, target, '?target=' + target + '&view=search');
    });

    $('.main').on('click', 'a.favorite', function (event) {
        event.preventDefault();
        var target = $(this).attr('data-id');
        var saveState = $(this).attr('data-state');
        if (saveState === 'unsaved') {
            var title = $(this).prev().html();
            localStorage.setItem(target, title);
            $('.alert').html('Saved to favorites.').show();
            $('.favorite').html('<span class="glyphicon glyphicon-star"></span');
            $(this).attr('data-state', 'saved');
            updateFavoritesList();
        }
        else {
            localStorage.removeItem(target);
            $(this).attr('data-state', 'unsaved');
            $('.alert').html('Removed from favorites.').show();
            $('.favorite').html('<span class="glyphicon glyphicon-star-empty"></span');
            updateFavoritesList();
        }
    });

    $('.navbar-headnav').on('click', 'a.fav-link', function (event) {
        event.preventDefault();
        setCurrentPosition();
        var target = $(this).attr('data-id');
        History.pushState({type: 'law', id: target}, target, '?target=' + target + '&view=law');
        if ($('.collapse').css('display') === 'block'){
            $('.collapse').collapse('hide');
        }
    });

    $('.navbar-headnav').on('click', 'a.fav-all', function (event) {
        event.preventDefault();
        setCurrentPosition();
        History.pushState({type: 'favorites', id: null}, 'Favorites', '?view=favorites');
        if ($('.collapse').css('display') === 'block'){
            $('.collapse').collapse('hide');
        }
    });

    $('.navbar-headnav').on('click', 'a.go-home', function (event) {
        event.preventDefault();
        var scroll = '0';
        History.pushState({type: 'home', id: null, pos: scroll}, 'Home', '/');
    });

    $('.main').swipe({
        swipe:function(event, direction, distance, duration, fingerCount) {
            if (direction === 'right'){
                History.back();
            }
            if (direction === 'left'){
                History.go(1);
            }
        },
        allowPageScroll: 'vertical'
    });

    $(function() {
        FastClick.attach(document.body);
    });

};

// Check if a new cache is available on page load.
window.addEventListener('load', function () {

    window.applicationCache.addEventListener('updateready', function () {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
        // Browser downloaded a new app cache.
        // Swap it in and reload the page to get the new code.
            window.applicationCache.swapCache();
            if (confirm('A new version of LaCrimBook is available. Load it?')) {
                window.location.reload();
            }
        }
        else {
        // Manifest didn't change. Nothing new to server. Set up data
        }
    }, false);

    $.ajax({url: 'data/data.json', data:'json', beforeSend: function () { $('.panel').hide(); }})
    .done(function(data){
        var lawData = data,
        onSuccess = function () {
            $('.loading').hide();
            $('.panel').show();
            State = History.getState();
            var t = State.url.queryStringToJSON();
            History.pushState({type: t.view, id: t.target}, $('title').text(), State.urlPath);
            updateContent(History.getState(),function () {
                updateFavoritesList();
            });
            console.log('transaction done.');
        },
        onFail = function (tx,err) {
            console.log(err);
        },
        onTransact = function () {
            console.log('transaction successful');
        },
        okInsert = function (tx, results) {
            console.log('rowsAffected: ' + results.rowsAffected + ' -- should be 1');
        };

        db = window.openDatabase(dbName, '', 'La. Crim Book 6-2014',2 * 1024 * 1024);

        if (db.version !== latestDbVersion){

            db.changeVersion(db.version,latestDbVersion);
            db.transaction(function (tx) {
                tx.executeSql('DROP TABLE laws',[], onTransact,onFail);
            });

            db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS laws ( `id` INTEGER PRIMARY KEY AUTOINCREMENT, `docid` TEXT, `sortcode` TEXT, `title` TEXT, `description` TEXT, `law_text` TEXT); ',[], onTransact,onFail);
            });
    //here
            db.transaction(function (tx) {
                var q = 'INSERT INTO laws (docid, sortcode,title,description,law_text) VALUES (?,?,?,?,?)';
                for (var i = 0, l = lawData.length; i < l; i ++) {
                    var obj = lawData[i];
                    var arr = [];
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            var val = obj[key];
                            // use val
                            arr.push(val);
                        }
                    }
                    tx.executeSql(q, arr, okInsert, onFail);
                }
            },  onFail, onSuccess);
        } else {
            onSuccess();
            
        }
    })
    //end here
    .fail(function(jqXHR, textStatus, errorThrown){
        $('.alert').html('Error Retrieving Laws:' + errorThrown).show();
    });

}, false);

if (window.cordova){
    document.addEventListener('deviceready', init, false);
} else {
    $(document).ready(function () {
        init();
    });
}
