// Smooth scroll for navigation links
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.hash) {
      e.preventDefault();
      const target = document.querySelector(this.hash);
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    }
  });
});
// Fun effect: bounce the logo on hover
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('mouseenter', () => {
    logo.style.transition = 'transform 0.3s';
    logo.style.transform = 'scale(1.12) rotate(-5deg)';
  });
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'none';
  });
} 