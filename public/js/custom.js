// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
    scrollFunction()
  };
  
  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("myBtn").style.display = "block";
    } else {
      document.getElementById("myBtn").style.display = "none";
    }
  }
  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
  
  //Langsung ke header
  $('.panel-collapse').on('shown.bs.collapse', function (e) {
    var $panel = $(this).closest('.panel');
    $('html,body').animate({
      scrollTop: $panel.offset().top
    }, 500);
  });

//Count total and submit in form function
$(document).ready(function () {

    $("input[value='Submit']").click(function () {
      
      //Fungsi untuk mencari aspek yang belum terpenuhi (tidak) nambahi div
      var radios = $('input[type="radio"]:checked').filter(function() {
        return this.value == 50;
        });
        for (var i = 0; i < radios.length; i++) {
          console.log(radios[i].parentNode.firstElementChild.innerText);
        }
      
      //Get value of checked radio button
      var values = $('input[type="radio"]:checked').map(function () {
        return this.value;
        }).get();

        //convert string array into number array
        values = values.map(Number);
        //function to count total value of radio button
        function getSum(total, num) {
          return total + num;
        }

        //variabel to show result of counted array
        var total = values.reduce(getSum);
        var total = total/values.length;

        //Input hasil penilaian ke backend
        var inputHasil = document.getElementById('hasilAssesment');
        inputHasil.value = total.toString();
        console.log(inputHasil.value);

    });
  });