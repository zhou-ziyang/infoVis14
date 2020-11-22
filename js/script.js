//fullpage scrolling
new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: 'right',
    navigationTooltips: ['Overview', 'Impact'],
    scrollBar: true
});

//opacity of background
$(window).scroll(function() {
    let scrollTop = $(this).scrollTop();
    $('#map_bg').css({
        opacity: function() {
            let elementHeight = $(this).height();
            return (elementHeight - scrollTop) / elementHeight;
        }
    });
});

//map
jQuery('#map_svg').vectorMap({
    map: 'germany_en',
    backgroundColor: null,
    enableZoom: false,
    showTooltip: false
});