(() => {
  const dateEl = document.getElementById("thanksgiving-date");
  const countdownEl = document.getElementById("countdown");
  const notesList = document.getElementById("notes-list");
  const noteCount = document.getElementById("note-count");
  const statusEl = document.getElementById("note-status");
  const form = document.getElementById("gratitude-form");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const storageKey = "thanksgiving-gratitude-notes";
  const defaultNotes = [
    {
      name: "Grandma Ruth",
      message: "Save me a corner piece of pumpkin pie — I’m bringing extra whipped cream.",
      created: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    },
    {
      name: "Sam & Lee",
      message: "We’re thankful for this crew and the loudest laugh track. Can’t wait to squeeze everyone.",
      created: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    },
    {
      name: "Ari",
      message: "Calling dibs on hosting the midnight tea round. Here’s to cozy playlists and long talks.",
      created: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];

  const backend = createBackend(window.BACKEND_CONFIG);
  let notes = [];

  const thanksgiving = getNextThanksgiving();
  if (dateEl) {
    dateEl.textContent = formatThanksgiving(thanksgiving);
  }

  if (countdownEl) {
    updateCountdown();
    setInterval(updateCountdown, 1000 * 60); // update every minute
  }

  loadAndRenderNotes();

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim() || "A friend";
      const message = messageInput.value.trim();

      if (!message) {
        messageInput.focus();
        return;
      }

      const entry = {
        name,
        message: message.slice(0, 180),
        created: new Date().toISOString(),
      };

      if (backend) {
        setStatus("Saving to the shared board…", "live");
        try {
          const saved = await backend.createNote(entry);
          notes.unshift(saved || entry);
          renderNotes(notes);
          setStatus("Saved for everyone.", "success");
        } catch (error) {
          console.warn("Backend unavailable, saving locally instead.", error);
          notes.unshift(entry);
          persistLocal(notes);
          renderNotes(notes);
          setStatus("Backend unreachable — saved to this device only.", "error");
        }
      } else {
        notes.unshift(entry);
        persistLocal(notes);
        renderNotes(notes);
        setStatus("Saved on this device. Add a backend to share it.", "live");
      }

      form.reset();
      nameInput.focus();
    });
  }

  async function loadAndRenderNotes() {
    if (backend) {
      setStatus("Loading the shared board…", "live");
      try {
        notes = await backend.fetchNotes();
        if (!Array.isArray(notes)) {
          notes = [];
        }
        renderNotes(notes);
        setStatus("Live board is up to date.", "success");
        return;
      } catch (error) {
        console.warn("Could not load backend, falling back locally.", error);
        setStatus("Could not reach the backend. Using this device only.", "error");
      }
    }

    notes = loadLocal();
    renderNotes(notes);
    setStatus("Using local-only board. Add backend.config.js to share.", "live");
  }

  function loadLocal() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Could not read saved notes, falling back to defaults.", error);
    }
    return defaultNotes.slice();
  }

  function persistLocal(list) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 24)));
    } catch (error) {
      console.warn("Could not save notes.", error);
    }
  }

  function renderNotes(list) {
    if (!notesList) return;
    notesList.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("li");
      empty.className = "note";
      empty.textContent = "Add the first note and we’ll share it with the group.";
      notesList.appendChild(empty);
    } else {
      list.forEach((item) => {
        const li = document.createElement("li");
        li.className = "note";

        const name = document.createElement("strong");
        name.textContent = item.name || "Guest";

        const message = document.createElement("p");
        message.textContent = item.message || "";

        const time = document.createElement("span");
        time.className = "time";
        time.textContent = formatRelativeTime(item.created);

        li.appendChild(name);
        li.appendChild(message);
        li.appendChild(time);
        notesList.appendChild(li);
      });
    }

    if (noteCount) {
      noteCount.textContent = String(list.length);
    }
  }

  function setStatus(text, tone) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.classList.remove("success", "error", "live");
    if (tone) statusEl.classList.add(tone);
  }

  function formatRelativeTime(dateValue) {
    const date = new Date(dateValue);
    const now = new Date();
    const diff = now - date;
    const day = 1000 * 60 * 60 * 24;

    if (diff < day) {
      return "Today";
    }
    if (diff < day * 2) {
      return "Yesterday";
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function createBackend(config) {
    if (config && config.supabaseUrl && config.supabaseAnonKey) {
      return supabaseBackend(config);
    }
    return null;
  }

  function supabaseBackend(config) {
    const { supabaseUrl, supabaseAnonKey, table = "gratitude_notes" } = config;
    const baseUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/${table}`;
    const headers = {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    return {
      async fetchNotes() {
        const url = `${baseUrl}?select=name,message,created&order=created.desc&limit=24`;
        const res = await fetch(url, { headers, cache: "no-store" });
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      },
      async createNote(entry) {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error("Create failed");
        const data = await res.json();
        return Array.isArray(data) ? data[0] : entry;
      },
    };
  }

  function getThanksgivingDate(year) {
    const novFirst = new Date(year, 10, 1);
    const day = novFirst.getDay();
    const firstThursday = day <= 4 ? 4 - day : 11 - day;
    return new Date(year, 10, 1 + firstThursday + 3 * 7);
  }

  function getNextThanksgiving() {
    const now = new Date();
    const thisYear = getThanksgivingDate(now.getFullYear());
    if (now <= thisYear) return thisYear;
    return getThanksgivingDate(now.getFullYear() + 1);
  }

  function formatThanksgiving(date) {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function updateCountdown() {
    if (!countdownEl || !thanksgiving) return;
    const now = new Date();
    const diff = thanksgiving - now;

    if (diff <= 0) {
      countdownEl.textContent = "It’s feast day!";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    countdownEl.textContent = `${days} day${days === 1 ? "" : "s"} · ${hours} hr${hours === 1 ? "" : "s"}`;
  }
})();
