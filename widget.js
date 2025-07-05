// Serve AI Widget — Fully Fixed v2025
(async function () {
  const config = {
    avatar: "https://chatbot-dev-frontend.vercel.app/avatar.png",
    backendUrl: "https://serveai-backend-dev.onrender.com",
    brandColor: "#c6b29f",
    tooltip: "Hi there!\nNeed help?",
    bookingLink: "",
    greeting: "",
    services: [],
    businessName: "",
    personality: "",
    restrictions: "",
    contact: {},
    hours: "",
    address: "",
    instagramHandle: "",
    tiktokHandle: "",
    youtubeChannel: ""
  };

  const configCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNlo_XO1Fac5Ioz16KxO6VheBzyNfPNGiBRbX9ZAOV1a0Qyh6GzjfMtskITIms8FpFluco9l9z2sIO/pub?output=csv";

  const papaScript = document.createElement("script");
  papaScript.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
  papaScript.onload = async () => {
    try {
      const res = await fetch(configCsvUrl);
      const text = await res.text();
      const parsed = Papa.parse(text, { header: true });
      const conf = Object.fromEntries(parsed.data.map(row => [row.key?.trim(), row.value?.trim()]));

      config.greeting = conf.greeting || "";
      config.bookingLink = conf.bookingLink || "";
      config.services = conf.services?.split(";").map(s => s.trim()) || [];
      config.businessName = conf.businessName || "";
      config.personality = conf.personality || "";
      config.restrictions = conf.restrictions || "";
      config.hours = conf.hours || "";
      config.address = conf.address || "";
      config.contact = {
        phone: conf.phone || "",
        email: conf.email || ""
      };
      config.instagramHandle = conf.instagramHandle || "";
      config.tiktokHandle = conf.tiktokHandle || "";
      config.youtubeChannel = conf.youtubeChannel || "";
    } catch (err) {
      console.warn("Failed to load Google Sheet config:", err);
    }

    const style = document.createElement("style");
    style.innerHTML = `
      #chat-toggle-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 9999; }
      #chat-tooltip {
        background: #fff; color: #333; padding: 6px 10px; border-radius: 8px;
        font-size: 14px; position: absolute; bottom: 60px; right: 0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2); max-width: 200px;
      }
      #chat-toggle-wrapper.hide-tooltip #chat-tooltip { display: none; }
      #chat-toggle {
        background: ${config.brandColor}; border-radius: 50%; width: 56px; height: 56px;
        display: flex; justify-content: center; align-items: center; cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      #chat-toggle img { width: 30px; height: 30px; }
      #chat-container {
        display: none; flex-direction: column; position: fixed; bottom: 90px; right: 20px;
        width: 340px; max-height: 500px; background: #fff; border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.2); overflow: hidden;
        font-family: sans-serif; z-index: 9999;
      }
      .messages { flex: 1; overflow-y: auto; padding: 12px; background: #f7f7f7; }
      .message { margin-bottom: 10px; display: flex; align-items: flex-start; }
      .bot-avatar { width: 28px; height: 28px; border-radius: 50%; margin-right: 8px; }
      .bot-bubble, .user-bubble {
        background: #eee; padding: 10px 12px; border-radius: 12px;
        max-width: 80%; font-size: 14px; line-height: 1.4;
      }
      .message.user { justify-content: flex-end; }
      .user-bubble { background: ${config.brandColor}; color: #fff; }
      #input-form { display: flex; border-top: 1px solid #ddd; }
      #input {
        flex: 1; padding: 10px; border: none; outline: none; font-size: 14px;
      }
      #send {
        background: ${config.brandColor}; color: #fff; border: none;
        padding: 10px 14px; cursor: pointer;
      }
      .booking-button {
        display: inline-block; margin-top: 8px; padding: 6px 10px;
        background: ${config.brandColor}; color: #fff; border-radius: 6px;
        text-decoration: none;
      }
      .quick-reply {
        background: #eee; border: none; border-radius: 6px;
        padding: 6px 10px; margin: 4px; cursor: pointer; font-size: 13px;
      }
    `;
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
        msg.innerHTML = `<div class="user-bubble">${text}</div>`;
      }
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function addTypingDots() {
      const typing = document.createElement("div");
      typing.className = "message bot";
      typing.id = "typing-indicator";
      typing.innerHTML = `<img src="${config.avatar}" class="bot-avatar" /><div class="bot-bubble typing-dots">...</div>`;
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTypingDots() {
      const el = document.getElementById("typing-indicator");
      if (el) el.remove();
    }

    async function sendMessage(text) {
      addMessage(text, "user");
      inputField.value = "";
      addTypingDots();
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
            restrictions: config.restrictions,
            hours: config.hours,
            address: config.address,
            instagramHandle: config.instagramHandle,
            tiktokHandle: config.tiktokHandle,
            youtubeChannel: config.youtubeChannel
          }),
        });
        const data = await res.json();
        removeTypingDots();
        addMessage(data.reply, "bot");
      } catch (err) {
        removeTypingDots();
        addMessage("Sorry, something went wrong.", "bot");
      }
    }

    inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = inputField.value.trim();
      if (!text) return;

      const triggers = ["who built you", "who made you", "are you a chatbot"];
      if (triggers.some(t => text.toLowerCase().includes(t))) {
        addMessage("I’m a custom AI assistant built by Serve AI to help businesses like this grow. 👉 https://calendly.com/stephen4934", "bot");
        inputField.value = "";
        return;
      }

      sendMessage(text);
    });

    const replyContainer = document.createElement("div");
    replyContainer.style.margin = "10px 20px";
    replyContainer.style.display = "flex";
    replyContainer.style.flexWrap = "wrap";
    ["What services do you offer?", "Do I need an appointment?", "Where are you located?"].forEach(text => {
      const btn = document.createElement("button");
      btn.innerText = text;
      btn.className = "quick-reply";
      btn.onclick = () => sendMessage(text);
      replyContainer.appendChild(btn);
    });

    messages.appendChild(replyContainer);
    if (config.greeting) addMessage(config.greeting, "bot");
  };

  document.head.appendChild(papaScript);
})();
