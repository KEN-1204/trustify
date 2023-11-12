import { cssTransition } from "react-toastify";

export const Zoom = cssTransition({
  enter: "zoomIn",
  exit: "zoomOut",
  // collapse: false,
  // collapseDuration: 100,
});
