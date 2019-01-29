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

//Count total in form function
$(document).ready(function () {
  
  // Buat Testing
  // $('form').submit(function(e) {
  //   e.preventDefault();
  // });

    $("input[value='Submit']").click(function () {
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

      //Fungsi untuk mencari aspek yang belum terpenuhi (tidak) nambahi div
      // var radios = $('input[type="radio"]:checked').filter(function() {
      //   return this.value == 50;
      // });
      // for (var i = 0; i < radios.length; i++) {
      //   console.log(radios[i].parentNode.firstElementChild.innerText);
      // }

      //variabel to show result of counted array
      var total = values.reduce(getSum);
      var total = total/values.length;
      //console result
      //console.log(values);
      //console.log(total);
      confirm("Apakah penilaian yang dimasukkan sudah benar?");

      //Input hasil penilaian ke backend
      var input = document.getElementById('hasilAssesment');
      input.value = total.toString();

    });
  });