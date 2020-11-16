/* globals jlinq, getExcerpt, confirm */
var myData,
    State,
    appName = "LACrimBook",
    History = window.History,
    pageDepth = 1,
    lawSections = [          //Corresponds to West thumb index;
    {'name':'Title 14', 'start': 'RS 000014' },
    {'name':'Title 15', 'start': 'RS 000015' },
    {'name':'Title 32', 'start': 'RS 000032' },
    {'name':'Title 40', 'start': 'RS 000040' },
    {'name':'Title 46', 'start': 'RS 000046' },
    {'name':'Title 56', 'start': 'RS 000056' },
    {'name':'Code of Criminal Procedure', 'start': 'CCRP' },
    {'name':'Code of Evidence', 'start': 'CE' },
    {'name':'Childrens Code', 'start': 'CHC' },
    {'name':'Constitution', 'start': 'CONST' }
];

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

    if (loc.view === 'search' || loc.view === 'list' ||  loc.view === 'law' || loc.view ==='favorites') {
        $('#app-name').text('');
        $('.navbar-brand i').show();
    } else {
        $('#app-name').text(appName);
        $('.navbar-brand i').hide();
        $(document).scrollTop(0); //Always scroll to top on main page
    }

    switch (view) {
    case 'list':
        items = ' <div class="list-group display-rows">';
        laws = jlinq.from(myData).starts('sortcode', target + ' ').select();
        for (var i = 0, l = laws.length; i < l; i ++) {
            items += '<a class="law-link list-group-item" href="#" data-id="' + laws[i].id + '"><span class="text-muted">' + 
            laws[i].title + '</span>&nbsp;' + laws[i].description + '</a>';
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
            fav = '<a href="#" class="sharer upper-right-corner-but-one" title="Share"' +
            '><span class="fa fa-share-alt"></span></a>  ' +
            '<a href="#" class="favorite upper-right-corner" data-state="saved" data-id="' + target +
            '" title="Favorite This"><span class="fa fa-star"></span></a>';
        }
        else {
            fav = '<a href="#" class="sharer upper-right-corner-but-one" title="Share"' +
            '><span class="fa fa-share-alt"></span></a>  ' +
            '<a href="#" class="favorite upper-right-corner" data-state="unsaved" data-id="' + target +
            '" title="Favorite This"><span class="fa fa-star-o"></span></a>';
        }
        $('title').text(laws[0].title + ' ' + laws[0].description);
        $('.panel').css({'padding':'10px'}).html('<h3><span class="lawTitle">' + laws[0].title + ' '  +
        laws[0].description + '</span>' + fav + '</h3>' + laws[0].law_text);
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
        $('.panel').html(items);
        $(document).scrollTop(pos);
        break;
    case 'favorites':
        items = ' <div class="list-group display-rows">';
        if (localStorage.length > 0) {
            for (i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (!isNaN(key)){
                    laws = jlinq.from(myData).equals('id', key).select();
                    items += '<a class="law-link list-group-item" href="#" data-id="' + laws[0].id + '">' + laws[0].description +
                    ' ' + laws[0].title + '</a>';
                }
            }
        }
        else {
            items += '<a class="list-group-item">You don\'t have any favorited laws</a>';
            items += '</div>';
            $('.panel').html(items);
            $(document).scrollTop(pos);
        }

        break;
    default:
        var menu = ' <div class="list-group">';
        for (var int = 0, l = lawSections.length; int < l; int ++) {
            var v = lawSections[int];
            menu += '<a class="nav-link list-group-item list-group-item " data-id="' + v.start + '" href="#">' +
            '<i class="fa fa-angle-right pull-right"></i>  ' + v.name + '</a>';
        }
        menu += '</div>';
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
                if (!isNaN(localStorage.key(i))){
                    key = localStorage.key(i);
                    value = localStorage.getItem(key);
                    favList += '<li><a class="fav-link" href="#" data-id="' + key + '">' + value + '</a></li>';
                }
            }
            favList += '<li class="divider"></li><li><a class="fav-all" href="#">View All</a></li>';
        }
        else {
            for (i = 0; i < localStorage.length; i++) {
                if (!isNaN(localStorage.key(i))){
                    key = localStorage.key(i);
                    value = localStorage.getItem(key);
                    favList += '<li><a class="fav-link" href="#" data-id="' + key + '">' + value + '</a></li>';
                }
            }
        }

        if ($('ul.dropdown-menu li').length === 0){
            favList += '<li>No favorites yet.</li>';
        }
        
        $('.dropdown-menu').html(favList);
    }
},
getQueryVariable = function (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
},
removeSlash = function (view){
    if (typeof view !== 'undefined'){
        return view.replace(/\/$/, '');
    }
    console.log('Query variable %s not found', variable);
},

browse = function (target, direction) {
    direction === 'forward' ?  target++ : target--;
    History.pushState({type: 'law', id: target}, target, '?target=' + target + '&view=law');
    pageDepth++;
},

init = function () {
    $.ajax({
        url: 'data/data.json', 
        dataType: 'json', 
        beforeSend: function (){ 
            $('.panel').hide(); 
        }
    })
    .done(function (data) {
        $('.loading').hide();
        $('.panel').show();
        myData = data;
        State = History.getState();
        var t = State.url.queryStringToJSON();
        History.pushState({type: t.view, id: t.target}, $('title').text(), State.urlPath);
        updateContent(History.getState(),function () {
            updateFavoritesList();
        });
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        $('.alert').html('Error Retrieving Laws:' + errorThrown).show();
    });

    //Handle History
    History.Adapter.bind(window, 'statechange', function () {
        updateContent(History.getState(), function () {
            updateFavoritesList();
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

    $('form').on('submit', function (event) {
        event.preventDefault();
        var target = $(this).find('.search-query').val();
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
            $('.favorite').html('<i class="fa fa-star"></i');
            $(this).attr('data-state', 'saved');
            updateFavoritesList();
        }
        else {
            localStorage.removeItem(target);
            $(this).attr('data-state', 'unsaved');
            $('.alert').html('Removed from favorites.').show();
            $('.favorite').html('<i class="fa fa-star-o"></i');
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
        //Use window.history here to avoid jquery.history plugin
        window.history.go(Math.abs(pageDepth) * -1);
        var scroll = '0';
    });

    $('.main').on('click', 'a.sharer', function (event) {
        event.preventDefault();
        var lawShareTitle = $('span.lawTitle').text();
            if (navigator.canShare) {
                navigator.share({
                    text: 'I\'ve shared a Louisiana law with you: ' +  $('span.lawTitle').text(),
                    title: 'LaCrimBook: ' + lawShareTitle,
                    url: window.location.href
                })
                .then(() => console.log('Share was successful.'))
                .catch((error) => console.log('Sharing failed', error));
                } else {
                    //alert(`Your system doesn't support sharing files.`);
                    var windowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
                    var mailText = encodeURIComponent('I\'ve shared a Louisiana Law with you: ' + lawShareTitle + ' ' + window.location.href);
                    window.open('mailto:?subject=LACrimBook&body=' + mailText, 'LACrimBook Share', windowFeatures);
                    }
                }
    );

    $('.main').swipe({
        swipe:function(event, direction, distance, duration, fingerCount) {
            if (direction === 'right'){
                browse(getQueryVariable('target'),'backward');
            }
            if (direction === 'left'){
                browse(getQueryVariable('target'),'forward');
            }
        },
        allowPageScroll: 'vertical'
    });

    if (localStorage.getItem('lacrimbook-notice-3.2.0') === null){
        $('#update-info').load('CHANGES');
        $('#update-info').show();
    }

    $('body').on('click', '.update-dismiss', function (event) {
        event.preventDefault();
        $('#update-info').remove();
        localStorage.setItem('lacrimbook-notice-3.2.0', true);
    });

};

$(document).ready(function() {
    init();
});
