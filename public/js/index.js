$(document).ready(function(){
    //Account Tab Init
    $('.tabular.menu .item').tab();
    //Load first tab
    $('.tabular.menu .item').tab('change tab','profile');

    //Init Modal
    $('.ui.modal').modal();
    //Bind Buttons to Modal
    $(".modalToggle").click(() => {
        $('.ui.modal').modal("toggle");
    });

    //Submit LogOut form
    $("#Logout").click(() => {
        $("#LogoutForm").submit();
    });
    
    $(".rating").rating("disable");

    //Disable user rating by default
    $("#UserRatingScale.rating").rating("disable");
    // $("#UserRatingScale.rating").rating("setting", "clearable", "true");

    const originalUserRating = $('#UserRatingScale').rating('get rating');
 
    //Enable rating when user wants to rate movie
    $('.rating-toggle').click((event) => {
        $('.rating-toggle').toggleClass("active")
        $('.rating-toggle').toggleClass("inactive")

        //Enable and show submit button based on if user is actively rating a movie
        if($('.rating-toggle').hasClass("active")){
            $('#UserRatingScale.rating').rating("enable")
            $('button.rating-submit').toggleClass("hide");
            $('button.clear-rating').toggleClass("hide");
        } else {
            $('#UserRatingScale.rating').rating("disable")
            $('button.rating-submit').toggleClass("hide");
            $('button.clear-rating').toggleClass("hide");
        }

        $('#UserRatingScale').rating('set rating', originalUserRating);

    });

    //Map data rating to hidden select form
    $('#UserRatingScale').rating('setting', 'onRate', function(value){
        const userRating = value;

        $('.rating-selector select option').filter(function(){
            return this.value == userRating
        }).attr("selected", "selected");
    })

    $('.clear-rating').click(() => {
        $('#UserRatingScale').rating('set rating', 0);
    })

    $('.rating-submit').click(() => {
        const userRating = $('#UserRatingScale').rating('get rating');

        if(userRating == 0){
            alert("If you want to submit a rating of 0, this will remove the movie from your rated list");
        }
    })

    $('.ui.dropdown').dropdown();

    $('#PasswordToggle').click(() => {
        const passwordField = $('#PasswordField');

        if(passwordField[0].type === "text"){
            passwordField[0].type = "password";
        } else {
            passwordField[0].type = "text";
        }
    });

    $('#ConfirmPasswordToggle').click(() => {
        const confirmPasswordField = $('#ConfirmPasswordField');

        if(confirmPasswordField[0].type === "text"){
            confirmPasswordField[0].type = "password";
        } else {
            confirmPasswordField[0].type = "text";
        }
    });
});