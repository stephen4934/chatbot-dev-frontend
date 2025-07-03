// Sun City Chatbot Widget — Fully Fixed with PapaParse CSV Handling
(async function () {
  const config = {
    avatar: "https://chatbot-frontend-ruby-five.vercel.app/avatar.png",
    backendUrl: "https://ai-chatbot-backend-lnub.onrender.com",
    brandColor: "#c6b29f",
    tooltip: "Hi there!\nNeed help?",
    bookingLink: "",
    greeting: "",
    services: [],
    businessName: "",
    personality: "",
    restrictions: "",
    contact: {}
  };

  const configCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNlo_XO1Fac5Ioz16KxO6VheBzyNfPNGiBRbX9ZAOV1a0Qyh6GzjfMtskITIms8FpFluco9l9z2sIO/pub?output=csv";

  async function loadConfigFromSheet() {
    try {
      const res = await fetch(configCsvUrl);
      const text = await res.text();
      const parsed = Papa.parse(text, { header: true });
      const conf = Object.fromEntries(parsed.data.map(row => [row.key?.trim(), row.value?.trim()]));
      config.greeting = conf.greeting;
      config.bookingLink = conf.bookingLink;
      config.services = conf.services.split(";").map(s => s.trim());
      config.businessName = conf.businessName;
      config.personality = conf.personality;
      config.restrictions = conf.restrictions;
      config.contact = { phone: conf.phone, email: conf.email };
    } catch (err) {
      console.warn("Failed to load Google Sheet config:", err);
    }
  }

  // Load PapaParse script dynamically
  const papaScript = document.createElement("script");
  papaScript.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
  papaScript.onload = async () => {
    await loadConfigFromSheet();

    // Insert styles
    const style = document.createElement("style");
    style.innerHTML = `/* styles remain unchanged */`;
    document.head.appendChild(style);

    const wrapper = document.createElement("div");
    wrapper.id = "chat-toggle-wrapper";
    wrapper.innerHTML = `
      <div id="chat-tooltip">${config.tooltip}</div>
      <div id="chat-toggle" title="Chat with our AI Assistant!">
        <img src="${config.avatar}" alt="Chatbot Icon" />
      </div>
    `;
    document.body.appendChild(wrapper);

    const chat = document.createElement("div");
    chat.id = "chat-container";
    chat.innerHTML = `
      <div id="messages" class="messages"></div>
      <form id="input-form">
        <input type="text" id="input" placeholder="Ask me anything..." autocomplete="off" />
        <button id="send" type="submit">Send</button>
      </form>
    `;
    document.body.appendChild(chat);

    const toggle = document.getElementById("chat-toggle");
    const tooltip = document.getElementById("chat-tooltip");
    const container = document.getElementById("chat-container");
    const messages = document.getElementById("messages");
    const inputForm = document.getElementById("input-form");
    const inputField = document.getElementById("input");

    setTimeout(() => wrapper.classList.add("hide-tooltip"), 8000);
    toggle.addEventListener("click", () => {
      wrapper.classList.add("hide-tooltip");
      container.style.display = container.style.display === "flex" ? "none" : "flex";
    });

    function addMessage(text, sender) {
      const msg = document.createElement("div");
      msg.className = "message " + sender;
      if (sender === "bot") {
        msg.innerHTML = `
          <img src="${config.avatar}" class="bot-avatar" />
          <div class="bot-bubble">${text}</div>
        `;
        if (text.toLowerCase().includes("book") || text.toLowerCase().includes("meeting")) {
          const button = document.createElement("a");
          button.href = config.bookingLink;
          button.target = "_blank";
          button.className = "booking-button";
          button.innerText = "Set up a Meeting";
          msg.querySelector(".bot-bubble").appendChild(button);
        }
      } else {
        msg.textContent = text;
      }
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage(text) {
      addMessage(text, "user");
      inputField.value = "";
      try {
        const res = await fetch(config.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            businessName: config.businessName,
            personality: config.personality,
            greeting: config.greeting,
            services: config.services,
            contact: config.contact,
            restrictions: config.restrictions
          }),
        });
        const data = await res.json();
        addMessage(data.reply, "bot");
      } catch (err) {
        addMessage("Sorry, something went wrong.", "bot");
      }
    }

    inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = inputField.value.trim();
      if (!text) return;

      const selfSellTriggers = [
        "who built you",
        "who made you",
        "who created you",
        "what company built you",
        "are you an ai",
        "are you a chatbot"
      ];

      if (selfSellTriggers.some(trigger => text.toLowerCase().includes(trigger))) {
        addMessage("I’m a custom AI assistant built by Serve AI to help businesses like this grow. Want one for your business? 👉 https://calendly.com/stephen4934", "bot");
        inputField.value = "";
        return;
      }

      sendMessage(text);
    });

    const replyContainer = document.createElement("div");
    replyContainer.style.margin = "10px 20px";
    replyContainer.style.display = "flex";
    replyContainer.style.flexWrap = "wrap";

    const quickReplies = [
      "What services do you offer?",
      "How does red light therapy work?",
      "Do I need an appointment?"
    ];

    quickReplies.forEach(text => {
      const btn = document.createElement("button");
      btn.innerText = text;
      btn.className = "quick-reply";
      btn.onclick = () => sendMessage(text);
      replyContainer.appendChild(btn);
    });

    messages.appendChild(replyContainer);
    addMessage(config.greeting, "bot");
  };

  document.head.appendChild(papaScript);
})();

