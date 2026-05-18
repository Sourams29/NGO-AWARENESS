// ===========================
//   InAmigos Foundation JS
// ===========================

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });
}

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Stats counter animation
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats-strip, .impact-section').forEach(el => counterObserver.observe(el));

// ========================
// VOLUNTEER FORM (volunteer.html)
// ========================
const volunteerForm = document.getElementById('volunteerForm');
if (volunteerForm) {
  const popup = document.getElementById('successPopup');
  const closePopup = document.getElementById('closePopup');
  const fileInput = document.getElementById('profilePhoto');
  const fileLabel = document.getElementById('fileLabel');

  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        fileLabel.textContent = `✓ ${file.name}`;
        fileLabel.style.color = 'var(--green)';
      }
    });
  }

  volunteerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      id: Date.now(),
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      city: document.getElementById('city').value.trim(),
      state: document.getElementById('state').value,
      age: document.getElementById('age').value,
      gender: document.getElementById('gender').value,
      skills: document.getElementById('skills').value,
      interests: document.getElementById('interests').value.trim(),
      motivation: document.getElementById('motivation').value.trim(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const existing = JSON.parse(localStorage.getItem('inamigos_volunteers') || '[]');
    existing.push(data);
    localStorage.setItem('inamigos_volunteers', JSON.stringify(existing));

    if (popup) {
      popup.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    volunteerForm.reset();
    if (fileLabel) { fileLabel.textContent = 'Click to upload or drag & drop'; fileLabel.style.color = ''; }
  });

  if (closePopup && popup) {
    closePopup.addEventListener('click', () => {
      popup.classList.remove('active');
      document.body.style.overflow = '';
    });
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  function validateForm() {
    let valid = true;
    const required = ['fullName', 'email', 'phone', 'city', 'state', 'age', 'gender', 'skills'];
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!el.value.trim()) {
        el.classList.add('error');
        valid = false;
      } else {
        el.classList.remove('error');
      }
    });
    const email = document.getElementById('email');
    if (email && email.value && !/\S+@\S+\.\S+/.test(email.value)) {
      email.classList.add('error'); valid = false;
    }
    const phone = document.getElementById('phone');
    if (phone && phone.value && !/^\d{10}$/.test(phone.value.replace(/\D/g,''))) {
      phone.classList.add('error'); valid = false;
    }
    return valid;
  }

  document.querySelectorAll('#volunteerForm input, #volunteerForm select, #volunteerForm textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
}

// ========================
// HISTORY PAGE (history.html)
// ========================
function loadHistory() {
  const tbody = document.getElementById('historyTbody');
  const emptyState = document.getElementById('emptyState');
  const totalCount = document.getElementById('totalCount');
  const todayCount = document.getElementById('todayCount');
  const cityCount = document.getElementById('cityCount');
  if (!tbody) return;

  const volunteers = JSON.parse(localStorage.getItem('inamigos_volunteers') || '[]');
  if (totalCount) totalCount.textContent = volunteers.length;
  if (todayCount) {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    todayCount.textContent = volunteers.filter(v => v.date === today).length;
  }
  if (cityCount) {
    const cities = new Set(volunteers.map(v => v.city));
    cityCount.textContent = cities.size;
  }

  renderTable(volunteers);

  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  function filterAndRender() {
    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const skill = filterSelect ? filterSelect.value : '';
    const filtered = volunteers.filter(v => {
      const matchQ = !q || v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.city.toLowerCase().includes(q);
      const matchSkill = !skill || v.skills === skill;
      return matchQ && matchSkill;
    });
    renderTable(filtered);
  }
  if (searchInput) searchInput.addEventListener('input', filterAndRender);
  if (filterSelect) filterSelect.addEventListener('change', filterAndRender);

  function renderTable(data) {
    tbody.innerHTML = '';
    if (data.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      document.querySelector('.table-wrapper').style.display = 'none';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';
    document.querySelector('.table-wrapper').style.display = 'block';
    data.forEach(v => {
      const initials = v.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', v.id);
      tr.innerHTML = `
        <td><div class="td-name"><div class="td-avatar">${initials}</div><div><strong>${v.name}</strong><span style="font-size:0.78rem;color:var(--gray-500)">${v.gender}, ${v.age} yrs</span></div></div></td>
        <td>${v.email}</td>
        <td>${v.phone}</td>
        <td>${v.city}, ${v.state}</td>
        <td><span class="skill-pill">${v.skills}</span></td>
        <td>${v.date}</td>
        <td><button class="delete-btn" onclick="deleteVolunteer(${v.id})" title="Delete"><i class="fas fa-trash"></i></button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function deleteVolunteer(id) {
  if (!confirm('Delete this application?')) return;
  let volunteers = JSON.parse(localStorage.getItem('inamigos_volunteers') || '[]');
  volunteers = volunteers.filter(v => v.id !== id);
  localStorage.setItem('inamigos_volunteers', JSON.stringify(volunteers));
  loadHistory();
}

if (document.getElementById('historyTbody')) loadHistory();

// ========================
// CONTACT FORM
// ========================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'var(--green)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

// Project filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-full-card').forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
