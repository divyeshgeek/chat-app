export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showNotification({ title, message, icon }) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body: message,
    icon: icon || "/avatar.png",
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
