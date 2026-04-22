import { showNotification } from "../notification.js";
import { langKeys, currentLang } from "../langSwitcher.js";

//==========================
// FORM SUBMISSION MODULE
//==========================

export function initFormListener() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const lang = langKeys[currentLang].forms;

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        showNotification(lang.formInvalidFields, "error");
        return;
      }

      showNotification(lang.emailSending, "info", -1);
      fetch("/php/sendEmail.php", {
        method: "POST",
        body: new FormData(form),
      })
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          if (data.trim() === "success") {
            showNotification(lang.emailSuccess, "success");
            form.reset();
            form.classList.remove("was-validated");
          } else {
            console.error(data);
            showNotification(lang.emailError, "error");
          }
        })
        .catch((error) => {
          console.error(error);
          showNotification(lang.emailError, "error");
        });
    });
  });
}
