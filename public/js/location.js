document.getElementById("update-form").addEventListener("submit", function(event) {
    console.log("Its WOrking");
    var zipInput = document.getElementById("zip").value;
    document.getElementById("hidden-locationId").value = zipInput;
  console.log('Hidden zipCode set to:', document.getElementById("hidden-locationId").value);
});