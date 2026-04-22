//==========================
// NOTIFICATION MODULE
//==========================

let currentNotification = null;

export function showNotification(text, type = "info", duration = 5000) {
    if (currentNotification) {
        currentNotification.remove();
        currentNotification = null;
    }
    
    const notificationBox = document.createElement("div");
    notificationBox.classList.add("notificationBox", type);

    const notificationText = document.createElement("span");
    notificationText.textContent = text;
    notificationBox.appendChild(notificationText);

    if (duration === -1) {
        const spinner = document.createElement("div");
        spinner.classList.add("spinner");
        notificationBox.appendChild(spinner);
    }
    
    document.body.appendChild(notificationBox);
    currentNotification = notificationBox;

    if (duration !== -1) {
        setTimeout(() => {
            if (!notificationBox.parentElement) return;
            notificationBox.classList.add("fade-out");
            notificationBox.addEventListener("transitionend", () => {
                notificationBox.remove();
                if (currentNotification === notificationBox) currentNotification = null;
            }, { once: true });
        }, duration);
    }
}