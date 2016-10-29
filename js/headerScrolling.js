var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('.field').outerHeight();

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    console.log("scrolleo");
    var st = $(this).scrollTop();
    console.log("navbarHeight", navbarHeight);
    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;
    
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('#searchBox').removeClass('nav-down').addClass('nav-up');
        console.log("Scroll abajo");
    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('#searchBox').removeClass('nav-up').addClass('nav-down');
            console.log("Scroll up")
        }
    }
    
    lastScrollTop = st;
}