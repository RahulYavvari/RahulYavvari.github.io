// Simple router + data generators
const routes = {
    home: homeView,
    about: () => `
      <div class="max-w-2xl mx-auto px-2">
        <h1 class="text-3xl font-extrabold mb-4 text-gray-900">About Me</h1>
        <div class="prose max-w-none text-gray-900">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vehicula ex eu ex dignissim, a gravida orci viverra.</p>
          <p>Phasellus nec lacus ut purus scelerisque tincidunt. Morbi at placerat eros, in tempor nunc. Integer ac nisl vel libero vulputate lacinia.</p>
        </div>
      </div>
    `,
    skills: () => `
      <div class="max-w-2xl mx-auto px-2">
        <h1 class="text-3xl font-extrabold mb-4 text-gray-900">Skills</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div>
            <div class="font-bold text-gray-800 mb-1">Programming</div>
            <div class="text-gray-700">JavaScript, Python, C++</div>
          </div>
          <div>
            <div class="font-bold text-gray-800 mb-1">Databases</div>
            <div class="text-gray-700">MySQL, PostgreSQL, MongoDB</div>
          </div>
          <div>
            <div class="font-bold text-gray-800 mb-1">Others</div>
            <div class="text-gray-700">Git, Linux, Docker</div>
          </div>
        </div>
      </div>
    `,
    // Remove hardcoded experience and education routes, and refactor projects
    experience: async () => {
      const list = await fetch('experience.json').then(r => r.json());
      const cards = list.map(exp => `
        <li class="flex flex-row items-center gap-3 border-b border-gray-200 py-4 bg-white px-3 mb-2">
          <div class="flex-1 flex flex-col justify-center">
            <div class="font-bold text-lg mb-0.5 text-gray-900">${exp.company}</div>
            <div class="flex justify-between items-center mb-1">
              <span class="italic text-gray-700">${exp.role}</span>
              <span class="text-xs text-gray-500">${exp.location}</span>
            </div>
            <div class="text-gray-500 text-xs mb-1">${exp.dates}</div>
            <ul class="list-disc pl-6 text-gray-800 text-sm">
              ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        </li>
      `).join('');
      return `<div class="max-w-2xl mx-auto px-2">
        <h1 class="text-3xl font-extrabold mb-6 text-gray-900">Experience</h1>
        <ul>${cards}</ul>
      </div>`;
    },
    education: async () => {
      const list = await fetch('education.json').then(r => r.json());
      const cards = list.map(edu => `
        <li class="flex flex-row items-center gap-3 border-b border-gray-200 py-4 bg-white px-3 mb-2">
          <div class="flex-1 flex flex-col justify-center">
            <div class="font-bold text-lg mb-0.5 text-gray-900">${edu.institution}</div>
            <div class="flex justify-between items-center mb-1">
              <span class="italic text-gray-700">${edu.degree}</span>
              <span class="text-xs text-gray-500">${edu.gpa ? 'GPA: ' + edu.gpa : ''}</span>
            </div>
            <div class="text-gray-500 text-xs mb-1">${edu.dates}</div>
            ${edu.related_coursework && edu.related_coursework.length ? `<div class='mt-2'><span class='font-semibold text-gray-800'>Related Coursework:</span><ul class='list-disc pl-6 text-gray-800 text-sm mt-1'>${edu.related_coursework.map(c => `<li>${c}</li>`).join('')}</ul></div>` : ''}
            ${edu.bullets && edu.bullets.length ? `<div class='mt-2'><span class='font-semibold text-gray-800'>What I did in college:</span><ul class='list-disc pl-6 text-gray-800 text-sm mt-1'>${edu.bullets.map(b => `<li>${b}</li>`).join('')}</ul></div>` : ''}
          </div>
        </li>
      `).join('');
      return `<div class="max-w-2xl mx-auto px-2">
        <h1 class="text-3xl font-extrabold mb-6 text-gray-900">Education</h1>
        <ul>${cards}</ul>
      </div>`;
    },
    projects: async () => {
      const list = await fetch('projects.json').then(r => r.json());
      const cards = list.map((p, i) => formatProj(p, i, list.length)).join('');
      return `<div class="max-w-2xl mx-auto px-2">
        <h1 class="text-3xl font-extrabold mb-4 text-gray-900">Projects</h1>
        <div class="prose max-w-none text-gray-900">
          <ul class="project-list">${cards}</ul>
        </div>
      </div>`;
    },
    blog: blogView,
    post: async (file) => {
        const list = await fetch('posts/posts.json').then(r => r.json());
        const postMeta = list.find(p => p.file === file);
        const md = await fetch(`posts/${file}`).then(r => r.text());
        function formatDate(dateStr, timeStr) {
            const d = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const datePart = d.toLocaleDateString(undefined, options);
            return timeStr ? `${datePart} · ${timeStr}` : datePart;
        }
        const tags = postMeta?.tags && postMeta.tags.length ? `<div class='flex flex-wrap gap-2 mt-1'>${postMeta.tags.map(tag => `<a href="#blog" data-tag="${tag}" class='bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded align-middle cursor-pointer tag-link'>${tag}</a>`).join('')}</div>` : '';
        const shareBtn = `<button id="share-btn" class="float-right mb-2 px-3 py-1 rounded bg-blue-100 text-blue-900 font-semibold hover:bg-blue-200 transition">Share</button><span id="share-feedback" class="ml-2 text-green-600 text-sm" style="display:none;">Copied!</span>`;
        setTimeout(() => {
          const btn = document.getElementById('share-btn');
          if (btn) {
            btn.onclick = async function() {
              const url = window.location.href;
              if (navigator.share) {
                try {
                  await navigator.share({ title: postMeta?.title, url });
                } catch (e) {}
              } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                const feedback = document.getElementById('share-feedback');
                if (feedback) {
                  feedback.style.display = 'inline';
                  setTimeout(() => { feedback.style.display = 'none'; }, 1500);
                }
              }
            };
          }
        }, 0);
        setTimeout(() => {
          attachTagClickHandlers();
        }, 0);
        return `
          <article class="max-w-none md:max-w-2xl lg:max-w-3xl mx-auto px-2 text-gray-900">
            <div class="flex justify-between items-center mb-2">
              <div class="text-gray-500 text-base">${formatDate(postMeta?.date, postMeta?.time)}</div>
              ${shareBtn}
            </div>
            ${tags}
            <div class="markdown-body mt-6">
              ${marked.parse(md)}
            </div>
          </article>
        `;
    }
};

// You can use HTML here, including links
const FOOTER_TEXT = 'built in <a href="https://neovim.io" class="underline text-blue-900" target="_blank" rel="noopener">neovim</a>';
window.FOOTER_TEXT = FOOTER_TEXT;

async function homeView() {
    // Use a smaller heading for About Me on the home page
    const aboutContent = `
      <h3 class="text-xl font-bold mb-2 text-gray-900">About Me</h3>
      <div class="prose max-w-none text-gray-900">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vehicula ex eu ex dignissim, a gravida orci viverra.</p>
        <p>Phasellus nec lacus ut purus scelerisque tincidunt. Morbi at placerat eros, in tempor nunc. Integer ac nisl vel libero vulputate lacinia.</p>
      </div>
    `;
    const projsArr = await fetch('projects.json').then(r => r.json());
    const projsSlice = projsArr.slice(0, 5);
    const projs = projsSlice.map((p, i) => formatProj(p, i, projsSlice.length)).join('');
    const postsArr = await getPosts();
    const postsSlice = postsArr.slice(0, 5);
    const posts = postsSlice.map((p, i) => formatBlog(p, i, postsSlice.length)).join('');
    const showMoreProjects = projsArr.length > 5;
    const showMorePosts = postsArr.length > 5;
    setTimeout(() => {
      var mobileContactLinks = document.getElementById('mobile-contact-links');
      if (mobileContactLinks && window.CONTACT_LINKS_HTML) {
        mobileContactLinks.innerHTML = window.CONTACT_LINKS_HTML;
      }
      var homeMobileContactLinks = document.getElementById('home-mobile-contact-links');
      if (homeMobileContactLinks && window.CONTACT_LINKS_HTML) {
        homeMobileContactLinks.innerHTML = window.CONTACT_LINKS_HTML;
      }
      attachTagClickHandlers();
    }, 0);
    return `
    <div class="md:hidden flex flex-col items-center mt-2">
      <img src='https://placehold.co/100' alt='Rahul Yavvari' class='rounded-full mb-4 w-32 h-32'>
      <div id="home-mobile-contact-links" class="text-center text-base font-semibold mb-6"></div>
    </div>
    <div class="mb-6 prose max-w-none md:prose-lg lg:prose-xl text-gray-900">
      <!-- <div class="text-lg text-gray-700 mb-4">Welcome to my newspaper-inspired blog and portfolio!</div> -->
      ${aboutContent}
    </div>
    <div class='flex justify-center my-2'><span class='text-gray-500 text-2xl select-none'>···</span></div>
    <section>
      <h3 class="!text-xl !font-bold mb-4">Projects</h3>
      <ul class="project-list">${projs}</ul>
      ${showMoreProjects ? '<a href="#projects" class="text-blue-900 font-semibold underline hover:underline">See more...</a>' : ''}
    </section>
    <div class='flex justify-center my-2'><span class='text-gray-500 text-2xl select-none'>···</span></div>
    <section>
      <h3 class="!text-xl !font-bold mb-4">Blog Posts</h3>
      <ul class="blog-list">${posts}</ul>
      ${showMorePosts ? '<a href="#blog" class="text-blue-900 font-semibold underline hover:underline">See more...</a>' : ''}
    </section>
    <footer class="md:hidden mt-10 text-center text-xs text-gray-500">${FOOTER_TEXT}</footer>
  `;
}

function projectsView() {
    const list = getProjects().map(formatProj).join('');
    return `<div class="prose max-w-none md:prose-lg lg:prose-xl text-gray-900">
      <h1 class="text-2xl sm:text-3xl font-extrabold mb-4 text-gray-900">Projects</h1>
      <ul class="project-list">${list}</ul>
    </div>`;
}

async function blogView() {
    const posts = await getPosts();
    setTimeout(() => { attachBlogSearch(); attachTagClickHandlers(); applyPendingBlogTag(); }, 0);
    return `<div class="prose max-w-none md:prose-lg lg:prose-xl text-gray-900 px-2 sm:px-0">
      <div class='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2'>
        <h1 class="text-3xl sm:text-3xl font-extrabold text-gray-900 m-0 mb-2">Blog</h1>
        <input id="blog-search" type="text" placeholder="Search" autocomplete="off" class="sm:w-96 w-full px-4 py-2 border border-gray-400 bg-gray-50 text-gray-900 shadow-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-base sm:text-sm mb-2 sm:mb-0" />
      </div>
      <ul class="blog-list">${posts.map((p, i) => formatBlog(p, i, posts.length)).join('')}</ul>
    </div>`;
}

// Debounce and throttle utility
function debounceAndThrottle(fn, delay, minInterval) {
  let timeout, lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < minInterval) return;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      lastCall = Date.now();
      fn.apply(this, args);
    }, delay);
  };
}

function attachBlogSearch() {
  const input = document.getElementById('blog-search');
  if (!input) return;
  const handleSearch = async function() {
    const posts = await getPosts();
    const q = this.value.trim().toLowerCase();
    const filtered = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
    );
    const blogList = document.querySelector('.blog-list');
    if (!blogList) return;
    // Animate fade out
    blogList.querySelectorAll('li').forEach(li => {
      li.classList.add('transition-all', 'duration-300', 'opacity-0', 'translate-y-2');
    });
    setTimeout(() => {
      blogList.innerHTML = filtered.length
        ? filtered.map((p, i) => formatBlog(p, i, filtered.length)).join('')
        : '<li class="text-center text-gray-500 py-8 w-full">No results found.</li>';
      // Animate fade in
      blogList.querySelectorAll('li').forEach(li => {
        li.classList.add('transition-all', 'duration-300', 'opacity-0', 'translate-y-2');
        setTimeout(() => {
          li.classList.remove('opacity-0', 'translate-y-2');
          li.classList.add('opacity-100', 'translate-y-0');
        }, 10);
      });
      attachTagClickHandlers();
    }, 300);
  };
  input.oninput = debounceAndThrottle(handleSearch, 400, 100);
}

function formatProj(p, idx, arrLength) {
    const borderClass = idx === arrLength - 1 ? '' : 'border-b';
    const image = p.image ? `<img src="${p.image}" alt="${p.title}" class="w-full h-32 object-cover rounded mb-2 mx-auto md:mx-0 md:mb-0 md:w-32 md:h-20 flex-shrink-0">` : '';
    return `<li class="flex flex-col md:flex-row items-center gap-3 ${borderClass} border-gray-200 py-4 bg-white px-3 mb-2">
        ${image}
        <div class="flex-1 flex flex-col justify-center w-full">
            <div class="font-bold text-lg mb-0.5 text-gray-900">${p.title}</div>
            <div class="text-gray-600 text-base mb-1">${p.desc}</div>
            <div class="project-links space-x-4 mt-1">
                <a href="${p.github}" class="text-blue-900 font-semibold">GitHub</a>
                ${p.demo ? `<a href="${p.demo}" class="text-blue-900 font-semibold underline hover:underline">Try <span style='font-size:1.1em'>&#8599;</span></a>` : ''}
            </div>
        </div>
    </li>`;
}

// Enhance formatBlog to render tags
function formatBlog(p, idx, arrLength) {
    function formatDate(dateStr, timeStr) {
        const d = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const datePart = d.toLocaleDateString(undefined, options);
        return timeStr ? `${datePart} · ${timeStr}` : datePart;
    }
    const borderClass = idx === arrLength - 1 ? '' : 'border-b';
    const tags = p.tags && p.tags.length ? `<span class='mx-1 text-gray-300'>·</span>${p.tags.map((tag, i) => `<a href="#blog" data-tag="${tag}" class='bg-green-100 text-green-700 text-[10px] font-medium px-1.5 py-0.5 rounded-sm align-middle${i > 0 ? " ml-1" : ""} cursor-pointer tag-link'>${tag}</a>`).join('')}` : '';
    const image = p.image ? `<img src="${p.image}" alt="${p.title}" class="w-full h-32 object-cover rounded mb-2 mx-auto md:mx-0 md:mb-0 md:w-32 md:h-20 flex-shrink-0">` : '';
    return `<li class="flex flex-col md:flex-row items-center gap-3 ${borderClass} border-gray-200 py-4 bg-white px-3 mb-2">
        ${image}
        <div class="flex-1 flex flex-col justify-center w-full">
            <a href="#post/${p.file}" class="w-auto inline-block self-start font-bold text-lg text-blue-900 hover:underline mb-0.5">${p.title}</a>
            <div class="text-gray-500 text-xs mb-1 flex items-center flex-wrap">${formatDate(p.date, p.time)}${tags}</div>
            ${p.description ? `<div class='text-base text-gray-700 mb-1'>${p.description}</div>` : ''}
            <a href="#post/${p.file}" class="w-auto inline-block self-start text-blue-900 font-semibold hover:underline mt-1 text-sm">Read more</a>
        </div>
    </li>`;
}

function getProjects() {
    return Array.from({ length: 10 }, (_, i) => ({
        title: `Project ${i + 1}`,
        desc: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Project ${i + 1} details.`,
        github: '#',
        demo: i % 2 ? null : '#'
    }));
}

async function getPosts() {
    const list = await fetch('posts/posts.json').then(r => r.json());
    const posts = await Promise.all(list.map(async p => {
        const md = await fetch(`posts/${p.file}`).then(r => r.text());
        const lines = md.split(/\r?\n/).filter(l => l.trim());
        return { ...p, excerpt: lines.slice(0, 3).join(' ') };
    }));
    posts.sort((a, b) => b.date.localeCompare(a.date));
    return posts;
}

async function router() {
    const [route, param] = (location.hash.slice(1) || 'home').split('/');
    const view = routes[route] || (() => `<h2>Not Found</h2>`);
    document.getElementById('content').innerHTML = await view(param);
    window.scrollTo(0, 0);
}function updateLiveDatetime() {
  const el = document.getElementById('live-datetime');
  if (!el) return;
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString(undefined, options);
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const dayStr = now.toLocaleDateString(undefined, { weekday: 'long' });
  el.textContent = `${dateStr} · ${timeStr} (${dayStr})`;
}
setInterval(updateLiveDatetime, 1000);
window.addEventListener('DOMContentLoaded', updateLiveDatetime);
window.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('close-menu');
  function openMenu() {
    menu.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
    menu.classList.add('translate-y-0', 'opacity-100');
  }
  function closeMenu() {
    menu.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
    menu.classList.remove('translate-y-0', 'opacity-100');
  }
  if (burger && menu) {
    burger.onclick = openMenu;
  }
  if (closeBtn && menu) {
    closeBtn.onclick = closeMenu;
  }
  // Close menu when any link is clicked
  if (menu) {
    menu.querySelectorAll('a').forEach(link => {
      link.onclick = closeMenu;
    });
  }
  // Ensure menu is closed on load
  closeMenu();
});

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Add modal HTML to the page if not present
if (!document.getElementById('project-modal')) {
  const modal = document.createElement('div');
  modal.id = 'project-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden';
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-sm w-full p-4 relative">
      <button id="close-project-modal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-900 text-2xl">&times;</button>
      <img id="modal-project-img" src="" alt="" class="w-20 h-20 object-cover rounded mx-auto mb-3">
      <div class="font-bold text-lg mb-2 text-center" id="modal-project-title"></div>
      <div class="text-gray-700 text-base" id="modal-project-desc"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

window.addEventListener('DOMContentLoaded', () => {
  // Project modal logic
  document.body.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.matches('[data-proj-idx]')) {
      e.preventDefault();
      const idx = target.getAttribute('data-proj-idx');
      const projs = await fetch('projects.json').then(r => r.json());
      const proj = projs[idx];
      if (proj) {
        document.getElementById('modal-project-img').src = proj.image || 'https://placehold.co/100';
        document.getElementById('modal-project-title').textContent = proj.title;
        document.getElementById('modal-project-desc').textContent = proj.desc;
        document.getElementById('project-modal').classList.remove('hidden');
      }
    }
    if (target.id === 'close-project-modal') {
      document.getElementById('project-modal').classList.add('hidden');
    }
    if (target.id === 'project-modal') {
      document.getElementById('project-modal').classList.add('hidden');
    }
  });
});

// Contact links rendering
fetch('contacts.json')
  .then(r => r.json())
  .then(links => {
    const html = links.map(link =>
      `<a href="${link.url}" target="_blank" rel="noopener" class="hover:underline">${link.label}</a>`
    ).join(' · ');
    window.CONTACT_LINKS_HTML = html;
    const container = document.getElementById('contact-links');
    if (container) container.innerHTML = html;
    const mobileContainer = document.getElementById('mobile-contact-links');
    if (mobileContainer) mobileContainer.innerHTML = html;
  });

// Blog search logic
// window.addEventListener('DOMContentLoaded', () => {
//   if (location.hash.startsWith('#blog')) {
//     setTimeout(() => {
//       const input = document.getElementById('blog-search');
//       if (!input) return;
//       input.addEventListener('input', async function() {
//         const posts = await getPosts();
//         const q = this.value.trim().toLowerCase();
//         const filtered = posts.filter(p =>
//           p.title.toLowerCase().includes(q) ||
//           (p.description && p.description.toLowerCase().includes(q)) ||
//           (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
//         );
//         const list = filtered.map((p, i) => formatBlog(p, i, filtered.length)).join('');
//         document.querySelector('.blog-list').innerHTML = list;
//       });
//     }, 0);
//   }
// });

// Add tag click handler to navigate and search
function attachTagClickHandlers() {
  document.querySelectorAll('.tag-link').forEach(el => {
    el.onclick = function(e) {
      e.preventDefault();
      window.PENDING_BLOG_TAG = this.getAttribute('data-tag');
      if (location.hash === '#blog') {
        router();
      } else {
        location.hash = '#blog';
      }
    };
  });
}

// After rendering the blog page, check for a pending tag search
function applyPendingBlogTag() {
  if (window.PENDING_BLOG_TAG) {
    const input = document.getElementById('blog-search');
    if (input) {
      input.value = window.PENDING_BLOG_TAG;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
      window.PENDING_BLOG_TAG = null;
    }
  }
}


