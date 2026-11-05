let request = 0;
let outgoing: Animation | undefined;
let restore: ReturnType<typeof setTimeout> | undefined;

export function cancelRouteMotion() {
  request += 1;
  outgoing?.cancel();
  outgoing = undefined;
  clearTimeout(restore);
}

export function animateRouteChange(navigate: () => void) {
  const main = document.querySelector("main");
  const style = main ? getComputedStyle(main) : null;
  const from = { opacity: style?.opacity ?? "1", transform: style?.transform ?? "none" };
  cancelRouteMotion();
  if (!main?.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    navigate();
    return;
  }

  const current = request;
  outgoing = main.animate([from, { opacity: 0.35, transform: "translateY(-8px)" }], {
    duration: 120,
    easing: "cubic-bezier(0.4, 0, 1, 1)",
    fill: "forwards",
  });
  void outgoing.finished
    .then(() => {
      if (current !== request) return;
      // Yavas veya kesilen gezinmede eski sayfa soluk kalmasin.
      restore = setTimeout(cancelRouteMotion, 700);
      navigate();
    })
    .catch(() => {});
}
