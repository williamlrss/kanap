'use strict';
export default function showAlert(message) {
  const alertContainer = document.createElement('div');
  alertContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  `;

  const alertContent = document.createElement('div');
  alertContent.style.cssText = `
    display: inline-block;
    padding: 20px;
    background-color: black;
    border-radius: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `;

  const alertMessage = document.createTextNode(message);
  alertContent.appendChild(alertMessage);
  alertContainer.appendChild(alertContent);
  document.body.appendChild(alertContainer);

  // Show alert with fade in effect
  requestAnimationFrame(() => {
    alertContainer.style.opacity = 1;
  });

  // Hide alert with fade out effect after 1 second
  setTimeout(() => {
    alertContainer.style.opacity = 0;
    setTimeout(() => {
      alertContainer.remove();
    }, 500); // Decreased timeout to 500ms for smoother transition
  }, 1000);
}

