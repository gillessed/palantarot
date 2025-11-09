import { notifications } from "@mantine/notifications";
import classes from "./SuccessNotification.module.css";

export function showSuccessNotification(message: string) {
  notifications.show({
    title: "Success",
    message,
    classNames: classes,
  });
}