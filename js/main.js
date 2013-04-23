//Handle history
$(function () {
    var History = window.History;
    if (History.enabled) {
        State = History.getState();
        // set initial state to first page that was loaded
        var t = State.url.queryStringToJSON();
        History.pushState({type: t.view, id: t.target}, $('title').text(), State.urlPath);
    } else {
        return false;
    }

    History.Adapter.bind(window, 'statechange', function () {
        updateContent(History.getState());
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
});

//Change content depending on state
var updateContent = function(State) {
    var target = State.data.id;
    var view = State.data.type;
    var pos = State.data.pos;
    var items;
    var laws;
    switch (view) {
    case 'list':
        items = ' <ul class="nav nav-tabs nav-stacked display-rows">';
        laws = jlinq.from(myData).starts('sortcode', target + ' ').select();
        $.each(laws, function (key, value) {
            items += '<li><a class="law-link" href="#" data-id="' + value.id + '">' + value.description + ' ' + value.title + '</a></li>';
        });
        items += '</ul>';
        $('.well').html(items);
        $(document).scrollTop(pos);
        break;
    case 'law':
        laws = jlinq.from(myData).equals('id', target).select();
        $('title').text(laws[0].description + ' ' + laws[0].title);
        $('.well').html('<h3>' + laws[0].description + '</h3>' + laws[0].law_text);
        $(document).scrollTop(pos);
        break;
    case 'search':
        laws = jlinq.from(myData).contains('law_text', target).select();
        items = '<div class="continer">';
        $.each(laws, function (key, value) {
            var snippet = getExcerpt(value.law_text, target, 5); 
            items += '<h4><a class="law-link" href="#" data-id="' + value.id +
            '">' + value.description + ' ' + value.title + '</a></h4>' +
            '<p>...' + snippet + '...</p>';
        });
        items += '</div>';
        $('.well').html(items);
        $('input').val(target);
        $(document).scrollTop(pos);
        break;
    default:
        var menu = ' <ul class="nav nav-tabs nav-stacked display-rows"> <li><a class="nav-link" data-id="RS 000014" href="#"><i class="icon-chevron-right"></i> Title 14</a></li> <li><a class="nav-link" data-id="RS 000015" href="#"><i class="icon-chevron-right"></i> Title 15</a></li> <li><a class="nav-link" data-id="RS 000032" href="#"><i class="icon-chevron-right"></i> Title 32</a></li> <li><a class="nav-link" data-id="RS 000040" href="#"><i class="icon-chevron-right"></i> Title 40</a></li> <li><a class="nav-link" data-id="RS 000046" href="#"><i class="icon-chevron-right"></i> Title 46</a></li> <li><a class="nav-link" data-id="RS 000056" href="#"><i class="icon-chevron-right"></i> Title 56</a></li> <li><a class="nav-link" data-id="CCRP" href="#"><i class="icon-chevron-right"></i> Code of Criminal Procedure </a></li> <li><a class="nav-link" data-id="CE" href="#"><i class="icon-chevron-right"></i> Code of Evidence </a></li> <li><a class="nav-link" data-id="CHC" href="#"><i class="icon-chevron-right"></i> Childrens Code</a></li> <li><a class="nav-link" data-id="CONST" href="#"><i class="icon-chevron-right"></i> Constitution</a></li> </ul>';
        $('.well').html(menu);
    }
};


$(document).ready(function () {
    //Handle clicks
    $('.main').on('click', 'a.nav-link', function (event) {
        event.preventDefault();
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

    //Handle swipes
    $('.main').wipetouch({
        wipeLeft: function (result) {History.go(1); },
        wipeRight: function (result) {History.back(); }
    });

});

