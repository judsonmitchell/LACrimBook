var myData;

$.ajax({url: 'data/data.json'}).done(function (data) { myData = data; });

$('.container').on('click', 'a.nav-link', function () {

    var target = $(this).attr('data-id');
    var items = '';
    var laws = jlinq.from(myData).starts('sortcode', target + ' ').select();
    $.each(laws, function (key, value) {
        items += '<li><a class="law-link" href="#" data-id="' + value.id + '">' + value.description + ' ' + value.title + '</a></li>';
    });
    $('.display-rows').html(items);
});

$('.container').on('click', 'a.law-link', function () {

    var target = $(this).attr('data-id');
    var law = jlinq.from(myData).equals('id',target).select();
    $('.well').html(law[0].law_text);
});
