
// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero Section Animation
gsap.from(".animate-hero", {
  opacity: 0,
  y: 50,
  duration: 1,
  stagger: 0.3,
  delay: 0.5,
});

// Section Animations
gsap.utils.toArray(".animate-section").forEach((section) => {
  gsap.from(section, {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
<script>
  window.addEventListener("load", function () {
    setTimeout(function () {
      document.getElementById("preloader").style.display = "none";
    }, 500); // Ensures preloader disappears after 0.5s even if page loads instantly
  });
</script>
