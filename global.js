console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// navigation, opens a new tab
// detects current page, detects server base path as local or github pages
let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "resume/", title: "Resume" },
  { url: "contact/", title: "Contact" },
  { url: "meta/", title: "Meta" },
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/" // Local server
    : "/portfolio/"; // GitHub Pages repo name

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  // Create link and add it to nav
  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;
  nav.append(a);
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current");
  } else {
    a.classList.add("tab");
  }
  a.target = "_blank";
}

// dropdown menu for theme
document.body.insertAdjacentHTML(
  "afterbegin",
  `
	<label class="color-scheme">
		Theme:
		<select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
		</select>
	</label>`,
);

// set the theme to the user's selection
let select = document.querySelector("select");

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty("color-scheme", colorScheme);
  select.value = colorScheme;
}

select.addEventListener("input", function (event) {
  console.log("color scheme changed to", event.target.value);
  document.documentElement.style.setProperty(
    "color-scheme",
    event.target.value,
  );
  localStorage.colorScheme = event.target.value;
});

if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// email message decoding
let form = document.querySelector("form");

form?.addEventListener("submit", function (event) {
  event.preventDefault();

  let data = new FormData(form);
  let url = form.action + "?";

  for (let [name, value] of data) {
    url += `${name}=${encodeURIComponent(value)}&`;
  }

  location.href = url;
});

// render projects
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
  }
}

export function renderProjects(
  projects,
  containerElement,
  headingLevel = "h2",
) {
  containerElement.innerHTML = "";

  for (const project of projects) {
    const article = document.createElement("article");
    // fix relative path for images
    const base = location.pathname.includes("/projects/") ? "../" : "./";
    const imageSrc = project.image.startsWith("http")
      ? project.image
      : base + project.image;
    article.innerHTML = `
        <${headingLevel}>${project.title}</${headingLevel}>
        <p>Year: ${project.year}</p>
        <img src="${imageSrc}" alt="${project.title}">
        <p>${project.description}</p>
        <a href="${project.link}" target="_blank">View project →</a>
    `;
    containerElement.appendChild(article);
  }
}

// fetch github profile stats for homepage
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
