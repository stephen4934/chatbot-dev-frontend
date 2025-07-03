// Sun City Chatbot Widget — Final Version with Google Sheet Config + Self-Sell Fix
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
      const rows = text.split("\n").map(r => r.split(","));
      const conf = Object.fromEntries(rows.slice(1).map(([k, v]) => [k.trim(), v.trim()]));
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

  await loadConfigFromSheet(); // ✅ Wait until config is loaded
  addMessage(config.greeting, "bot"); // ✅ Now it's safe to show the greeting

  const style = document.createElement("style");
  style.innerHTML = `
    #chat-toggle-wrapper { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }
    #chat-tooltip { background: #333; color: white; padding: 6px 10px; border-radius: 6px; font-size: 13px; white-space: pre-line; position: absolute; right: 60px; bottom: 12px; opacity: 1; transition: opacity 0.3s ease; pointer-events: none; }
    #chat-toggle-wrapper.hide-tooltip #chat-tooltip { opacity: 0; }
    #chat-toggle { background: none; border: none; cursor: pointer; }
    #chat-toggle img { width: 56px; height: 56px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    #chat-container { position: fixed; bottom: 100px; right: 24px; width: 360px; max-height: 90vh; display: none; flex-direction: column; background: #fffdfb; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); z-index: 9998; overflow: hidden; }
    .messages { flex: 1; padding: 20px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; gap: 16px; max-height: 400px; scroll-behavior: smooth; }
    .message { display: flex; align-items: flex-start; font-size: 15px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen; }
    .message.user { align-self: flex-end; background-color: #f3ebe4; color: #333; padding: 10px 14px; border-radius: 16px 16px 4px 16px; font-weight: 500; max-width: 85%; }
    .message.bot { align-self: flex-start; display: flex; max-width: 85%; }
    .bot-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; margin-right: 10px; flex-shrink: 0; }
    .bot-bubble { background-color: #f7f4f0; color: #111; padding: 10px 14px; border-radius: 16px 16px 16px 4px; font-weight: 500; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
    #input-form { display: flex; border-top: 1px solid #eee; }
    #input { flex: 1; border: none; padding: 14px; font-size: 15px; outline: none; background: #fffaf7; }
    #send { background: ${config.brandColor}; color: white; border: none; padding: 0 20px; font-weight: bold; cursor: pointer; }
    #send:hover { background: #b29f8a; }
    .quick-reply { background: #eee; border: none; border-radius: 20px; padding: 8px 14px; margin: 4px 6px 0 0; cursor: pointer; font-size: 14px; }
    .quick-reply:hover { background: #ddd; }
    .booking-button { display: inline-block; margin-top: 10px; padding: 8px 14px; background: ${config.brandColor}; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; }
  `;
  document.head.appendChild(style);

  // Full HTML structure
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
})();
