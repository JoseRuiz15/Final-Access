
// Codigo para el boton (INICIAR), para pasar de la pantalla de inicio a la pantalla de login
//botones
const startButton = document.getElementById("start-button");
const recordtButton = document.getElementById("record-button");
// pantallas
const homeScreen = document.getElementById("home-screen");
const loginScreen = document.getElementById("login-screen");
const recordScreen = document.getElementById("record-screen");

startButton.addEventListener("click", () => {
    homeScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
});

recordtButton.addEventListener("click", () => {
    loginScreen.classList.add("hidden");
    recordScreen.classList.remove("hidden");
})

//esto es para la contraseña no tocar por ahora cuidadito gabriel
function registrar() {
  const password = document.getElementById("password").value;
  const confirmPassword =
    document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    document.getElementById("mensaje").textContent =
      "Las contraseñas no coinciden";
    return;
  }

  document.getElementById("mensaje").textContent =
    "Registro exitoso";
}