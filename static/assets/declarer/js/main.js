$(function(){
    $("#form-total").steps({
        headerTag: "h2",
        bodyTag: "section",
        transitionEffect: "fade",
        //enableAllSteps: true,
        autoFocus: true,
        transitionEffectSpeed: 500,
        titleTemplate : '<div class="title">#title#</div>',
        labels: {
            previous : 'Précédent',
            next : 'Suivant',
            finish : 'Soumettre',
            current : ''
        },
        onStepChanging: function (event, currentIndex, newIndex) { 
            var couleur = $('#couleur').val();
            var description = $('#description').val();
          

            $('#username-val').text(couleur);
            $('#email-val').text(description);
           

            $("#form-register").validate().settings.ignore = ":disabled,:hidden";
            return $("#form-register").valid();
        },
        onFinished: function(event, currentIndex,newIndex){
            return $("#form-register").submit();
        }
    });
    $("#date").datepicker({
        dateFormat: "MM - DD - yy",
        showOn: "both",
        buttonText : '<i class="zmdi zmdi-chevron-down"></i>',
    });

    
});


