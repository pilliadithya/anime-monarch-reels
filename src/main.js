import "./style.css";

const title = document.querySelector("h1");
title.animate(
  [
    { opacity: 0, transform: "translateY(48px) skewY(3deg)" },
    { opacity: 1, transform: "translateY(0) skewY(0)" }
  ],
  { duration: 900, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }
);

document.querySelector(".chip").animate(
  [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
  { duration: 550, delay: 550, easing: "ease-out", fill: "both" }
);
