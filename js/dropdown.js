const dropdown = document.querySelector(".dropdown");
const button = document.querySelector(".dropbtn");

button.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");
});

document.addEventListener("click", () => {
  dropdown.classList.remove("show");
});
/* =====================================================
   AKHIR DROPDOWN.JS
   ===================================================== */