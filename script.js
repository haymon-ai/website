for (const slider of document.querySelectorAll("[data-slider]")) {
  const track = slider.querySelector(".slides");
  const slides = [...track.children];
  const captions = [...slider.querySelectorAll(".slider-caption")];
  const smooth = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  let current = 0;

  addEventListener("load", () =>
    track.querySelectorAll("img[loading=lazy]").forEach((img) => (img.loading = "eager")),
  );

  const show = (index) => {
    current = index;
    captions.forEach((caption, i) => (caption.hidden = i !== index));
  };

  const go = (index) => {
    const target = (index + slides.length) % slides.length;
    track.scrollTo({
      left: slides[target].offsetLeft,
      behavior: smooth ? "smooth" : "auto",
    });
    show(target);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) show(slides.indexOf(entry.target));
      }
    },
    { root: track, threshold: 0.6 },
  );
  slides.forEach((slide) => observer.observe(slide));

  slider.querySelectorAll("[data-step]").forEach((button) =>
    button.addEventListener("click", () =>
      go(current + Number(button.dataset.step)),
    ),
  );

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      go(current + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
}
