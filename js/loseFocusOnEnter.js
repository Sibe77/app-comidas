$('#searchterm').keypress(function(e){
    if(e.which == 13){
        $(this).blur();    
    }
});