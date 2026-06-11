
// Codigo para el boton (INICIAR), para pasar de la pantalla de inicio a la pantalla de login
//botones
const enterButton = document.getElementById("enter-button");
const startButton = document.getElementById("start-button");
const recordtButton = document.getElementById("record-button");
const registButton = document.getElementById("regist-button");
// pantallas
const homeScreen = document.getElementById("home-screen");
const loginScreen = document.getElementById("login-screen");
const recordScreen = document.getElementById("record-screen");
const codeScreen = document.getElementById("code-screen");

startButton.addEventListener("click", () => {
    homeScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
});

recordtButton.addEventListener("click", () => {
    loginScreen.classList.add("hidden");
    recordScreen.classList.remove("hidden");
})

registButton.addEventListener("click", () => {
    recordScreen.classList.add("hidden");
    codeScreen.classList.remove("hidden");
})

enterButton.addEventListener("click", () => {
    loginScreen.classList.add("hidden");
    codeScreen.classList.remove("hidden");
})
