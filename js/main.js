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
        // Manifest didn't changed. Nothing new to server.
        }
    }, false);

}, false);

function updateFavoritesList() {

    if (localStorage.length > 0) {
        var favList = '';
        
        if (localStorage.length > 4) {

            for (var i = 0; i < 5; i++) {
                var key = localStorage.key(i);
                var value = localStorage.getItem(key);
                favList += '<li><a class="fav-link" href="#" data-id="' + key + '">' + value + '</a></li>';
            }
            favList += '<li class="divider"></li><li><a class="fav-all" href="#">View All</a></li>';
        }
        else {

            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                var value = localStorage.getItem(key);
                favList += '<li><a class="fav-link" href="#" data-id="' + key + '">' + value + '</a></li>';
            }
        }

        $('.dropdown-menu').html(favList);
    }
}

//Handle history
$(function () {
    var History = window.History;
    if (History.enabled) {
        State = History.getState();
        // set initial state to first page that was loaded
        var t = State.url.queryStringToJSON();
        History.pushState({type: t.view, id: t.target}, $('title').text(), State.urlPath);
        updateFavoritesList();
    } else {
        return false;
    }

    History.Adapter.bind(window, 'statechange', function () {
        updateContent(History.getState());
        updateFavoritesList();
    });
});

//Get the data
var myData;

$.ajax({url: 'data/data.json', beforeSend: function () { $('.well').hide(); }})
.done(function (data) {
    $('.loading').hide();
    $('.well').show();
    myData = data;
    State = History.getState();
    var t = State.url.queryStringToJSON();
    History.pushState({type: t.view, id: t.target}, $('title').text(), State.urlPath);
    updateContent(History.getState());
})
.fail(function(jqXHR, textStatus, errorThrown){
    $('.alert').html('Error Retrieving Laws:' + errorThrown).show();
});

//Change content depending on state
var updateContent = function(State) {
    var target = State.data.id;
    var view = State.data.type;
    var pos = State.data.pos;
    var items;
    var laws;
    alert('pos: ' + pos + 'view: ' + view);
    //Ensure that any alert messages are hidden
    $('.alert').hide();

    switch (view) {
    case 'list':
        items = ' <ul class="nav nav-tabs nav-stacked display-rows">';
        laws = jlinq.from(myData).starts('sortcode', target + ' ').select();
        $.each(laws, function (key, value) {
            items += '<li><a class="law-link" href="#" data-id="' + value.id + '">' + value.title + ' ' + value.description + '</a></li>';
        });
        items += '</ul>';
        $('.well').html(items);
        $(document).scrollTop(pos);
        break;
    case 'law':
        laws = jlinq.from(myData).equals('id', target).select();
        //check to see if this law has been favorited
        var fav;
        if (localStorage.getItem(target)){
            fav = '<a href="#" class="favorite" data-state="saved" data-id="' + target +
            '" title="Favorite This"><i class="icon-ok-sign"></i></a>';
        }
        else {
            fav = '<a href="#" class="favorite" data-state="unsaved" data-id="' + target +
            '" title="Favorite This"><i class="icon-ok-circle"></i></a>';
        }
        $('title').text(laws[0].description + ' ' + laws[0].title);
        $('.well').html('<h3><span class="lawTitle">' + laws[0].description + '</span>' + fav + '</h3>' + laws[0].law_text);
        $(document).scrollTop(0);
        break;
    case 'search':
        laws = jlinq.from(myData).contains('law_text', target).select();
        items = '<div class="container">';
        $.each(laws, function (key, value) {
            //var snippet = getExcerpt(value.law_text, target, 5);
            //var snippet = "Working on generating statute preview.  Check back soon.";
            items += '<h4><a class="law-link" href="#" data-id="' + value.id +
            '">' + value.title + ' ' + value.description + '</a></h4>';
            //'<p>...' + snippet + '...</p>';
        });
        items += '</div>';
        $('.well').html(items);
        $('input').val(target);
        $(document).scrollTop(pos);
        break;
    case 'favorites':
        items = ' <ul class="nav nav-tabs nav-stacked display-rows">';
        if (localStorage.length > 0) {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                laws = jlinq.from(myData).equals('id', key).select();
                items += '<li><a class="law-link" href="#" data-id="' + laws[0].id + '">' + laws[0].description 
                + ' ' + laws[0].title + '</a></li>';
            }
        }
        else {
            items += '<li>You don\'t have any favorited laws</li>';
        }

        items += '</ul>';
        $('.well').html(items);
        $(document).scrollTop(pos);
        break;
    default:
        var menu = ' <ul class="nav nav-tabs nav-stacked display-rows"> <li><a class="nav-link" data-id="RS 000014" href="#"><i class="icon-chevron-right"></i> Title 14</a></li> <li><a class="nav-link" data-id="RS 000015" href="#"><i class="icon-chevron-right"></i> Title 15</a></li> <li><a class="nav-link" data-id="RS 000032" href="#"><i class="icon-chevron-right"></i> Title 32</a></li> <li><a class="nav-link" data-id="RS 000040" href="#"><i class="icon-chevron-right"></i> Title 40</a></li> <li><a class="nav-link" data-id="RS 000046" href="#"><i class="icon-chevron-right"></i> Title 46</a></li> <li><a class="nav-link" data-id="RS 000056" href="#"><i class="icon-chevron-right"></i> Title 56</a></li> <li><a class="nav-link" data-id="CCRP" href="#"><i class="icon-chevron-right"></i> Code of Criminal Procedure </a></li> <li><a class="nav-link" data-id="CE" href="#"><i class="icon-chevron-right"></i> Code of Evidence </a></li> <li><a class="nav-link" data-id="CHC" href="#"><i class="icon-chevron-right"></i> Childrens Code</a></li> <li><a class="nav-link" data-id="CONST" href="#"><i class="icon-chevron-right"></i> Constitution</a></li> </ul>';
        $('.well').html(menu);
        $(document).scrollTop(pos);
    }
};


$(document).ready(function () {
    //Handle clicks
    alert('debug9');
    $('.main').on('click', 'a.nav-link', function (event) {
        event.preventDefault();
        console.log(window.History);
        var target = $(this).attr('data-id');
        var scroll = $(document).scrollTop();
        History.pushState({type: 'list', id: target, pos: scroll}, target, '?target=' + target + '&view=list');
    });

    $('.main').on('click', 'a.law-link', function (event) {
        event.preventDefault();
        var target = $(this).attr('data-id');
        var scroll = $(document).scrollTop();
        History.pushState({type: 'law', id: target, pos: scroll}, target, '?target=' + target + '&view=law');
    });

    $('.search-btn').click(function (event) {
        event.preventDefault();
        var target = $(this).prev().val();
        var scroll = $(document).scrollTop();
        History.pushState({type: 'search', id: target, pos: scroll}, target, '?target=' + target + '&view=search');
    });

    $('.main').on('click', 'a.favorite', function (event) {
        event.preventDefault();
        var target = $(this).attr('data-id');
        var saveState = $(this).attr('data-state');
        if (saveState === 'unsaved') {
            var title = $(this).prev().html();
            localStorage.setItem(target, title);
            $('.alert').html('Saved to favorites.').show();
            $('.favorite').html('<i class="icon-ok-sign"></i>');
            $(this).attr('data-state', 'saved');
            updateFavoritesList();
        }
        else {
            localStorage.removeItem(target);
            $(this).attr('data-state', 'unsaved');
            $('.alert').html('Removed from favorites.').show();
            $('.favorite').html('<i class="icon-ok-circle"></i>');
            updateFavoritesList();
        }
    });

    $('.navbar-headnav').on('click', 'a.fav-link', function (event) {
        event.preventDefault();
        var target = $(this).attr('data-id');
        var scroll = $(document).scrollTop();
        History.pushState({type: 'law', id: target, pos: scroll}, target, '?target=' + target + '&view=law');
    });

    $('.navbar-headnav').on('click', 'a.fav-all', function (event) {
        event.preventDefault();
        var scroll = $(document).scrollTop();
        History.pushState({type: 'favorites', id: null, pos: scroll}, 'Favorites', '?view=favorites');
    });

    $('.navbar-headnav').on('click', 'a.go-home', function (event) {
        event.preventDefault();
        var scroll = '0';
        History.pushState({type: 'home', id: null, pos: scroll}, 'Home', '/');
    });

    //Handle swipes
    //$('.main').wipetouch({
    //    wipeLeft: function (result) {History.go(1); },
    //    wipeRight: function (result) {History.back(); }
    //});

});

