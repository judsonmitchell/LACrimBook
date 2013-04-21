//Handle history
$(function () {
    var History = window.History;
    if (History.enabled) {
        State = History.getState();
        // set initial state to first page that was loaded
        History.pushState({urlPath: window.location.pathname}, $('title').text(), State.urlPath);
    } else {
        return false;
    }

    History.Adapter.bind(window, 'statechange', function () {
        console.log(History.getState());
        updateContent(History.getState());
    });
});

//Get the data
var myData;
$.ajax({url: 'data/data.json'}).done(function (data) { myData = data; });

//Change content depending on state
var updateContent = function(State) {
    var target = State.data.id;
    var view = State.data.type;
    switch (view) {
    case 'list':
        var items = ' <ul class="nav nav-tabs nav-stacked display-rows">';
        var laws = jlinq.from(myData).starts('sortcode', target + ' ').select();
        $.each(laws, function (key, value) {
            items += '<li><a class="law-link" href="#" data-id="' + value.id + '">' + value.description + ' ' + value.title + '</a></li>';
        });
        items += '</ul>';
        $('.well').html(items);
        break;
    case 'law':
        var law = jlinq.from(myData).equals('id', target).select();
        $('.well').html(law[0].law_text);
        break;
    default:
        var menu = '<ul class="nav nav-tabs nav-stacked display-rows"> <li><a class="nav-link" data-id="RS 000014" href="#"><i class="icon-circle-arrow-right"></i> Title 14</a></li> <li><a class="nav-link" data-id="RS 000040" href="#"><i class="icon-circle-arrow-right"></i> Title 40</a></li> <li><a class="nav-link" data-id="CCRP" href="#"><i class="icon-circle-arrow-right"></i> Code of Criminal Procedure </a></li> <li><a class="nav-link" data-id="CE" href="#"><i class="icon-circle-arrow-right"></i> Code of Evidence </a></li> </ul>';
        $('.well').html(menu);
    }
};

//Handle clicks
$('.container').on('click', 'a.nav-link', function (event) {
    event.preventDefault();
    var target = $(this).attr('data-id');
    History.pushState({type: 'list', id: target}, target, '?target=' + target);
});

$('.container').on('click', 'a.law-link', function (event) {
    event.preventDefault();
    var target = $(this).attr('data-id');
    History.pushState({type: 'law', id: target}, target, '?target=' + target);
});

 $(function() {      
      //Enable swiping...
      $(".container").swipe( {
        //Generic swipe handler for all directions
        swipe:function(event, direction, distance, duration, fingerCount) {
          alert("You swiped " + direction );  
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
         threshold:0
      });
    });
  
