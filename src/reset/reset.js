function resetPassword() {
    let pass = document.getElementById("password").value;
    let Cpassword = document.getElementById("confirmPassword").value;

    if (pass != Cpassword) {
        alert("Passwords Must Match");
    }
}