// Sun City Chatbot Widget — Final Demo-Ready Layout (Scroll, Style, Start Closed)
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
    contact: {}
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

    // Styles
    const style = document.createElement("style");
    style.innerHTML = `
#chat-toggle-wrapper {
  position: fixed; bottom: 20px; right: 20px; z-index: 9998;
}
#chat-tooltip {
  background: #333; color: #fff; padding: 8px 12px; border-radius: 6px;
  font-size: 14px; position: absolute; bottom: 100%; right: 0; margin-bottom: 6px;
  white-space: pre-line; transition: opacity 0.3s ease;
}
#chat-toggle-wrapper.hide-tooltip #chat-tooltip {
  opacity: 0; pointer-events: none;
}
#chat-toggle {
  width: 64px; height: 64px; border-radius: 50%;
  background: ${config.brandColor}; display: flex; justify-content: center; align-items: center;
  cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
#chat-toggle img {
  width: 70%; height: 70%; object-fit: cover; border-radius: 50%;
}
#chat-container {
  position: fixed; bottom: 100px; right: 20px;
  width: 320px; max-height: 500px; background: #fff;
  border: 1px solid #ddd; border-radius: 12px;
  display: none; flex-direction: column; font-family: sans-serif;
  z-index: 9999; box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
#messages {
  flex: 1; padding: 10px; overflow-y: auto; max-height: 400px;
}
.message {
  margin: 10px 0;
}
.message.user {
  text-align: right;
}
.user-bubble {
  background: ${config.brandColor}; color: white;
  padding: 10px 14px; border-radius: 14px;
  max-width: 220px; display: inline-block; font-size: 14px;
}
.message.bot {
  display: flex; align-items: flex-start;
}
.bot-avatar {
  width: 36px; height: 36px; margin-right: 8px; border-radius: 50%;
}
.bot-bubble {
  background: #f4f4f4; padding: 10px 14px;
  border-radius: 14px; max-width: 220px; font-size: 14px;
}
.typing-dots {
  display: inline-block; font-size: 18px;
  animation: blink 1s infinite alternate;
}
@keyframes blink {
  0% { opacity: 0.2; }
  100% { opacity: 1; }
}
.booking-button {
  display: inline-block; margin-top: 8px;
  background: ${config.brandColor}; color: white;
  padding: 6px 12px; text-decoration: none;
  border-radius: 6px; font-size: 13px;
}
#input-form {
  display: flex; border-top: 1px solid #ddd;
}
#input {
  flex: 1; border: none; padding: 10px; font-size: 14px;
}
#send {
  background: ${config.brandColor}; color: white;
  border: none; padding: 10px 16px;
  font-weight: bold; cursor: pointer;
}
.quick-reply {
  margin: 4px 4px 0 0; padding: 6px 12px;
  background: #eee; border: none;
  border-radius: 16px; cursor: pointer; font-size: 13px;
}
@media (max-width: 480px) {
  #chat-container { width: 90%; right: 5%; bottom: 100px; }
}
    `;
    document.head.appendChild(style);

    // HTML
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

    // Toggle behavior
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
      container.style.flexDirection = "column";
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
      typing.innerHTML = `
        <img src="${config.avatar}" class="bot-avatar" />
        <div class="bot-bubble typing-dots">...</div>
      `;
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
            restrictions: config.restrictions
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

      const selfSellTriggers = [
        "who built you", "who made you", "who created you",
        "what company built you", "are you an ai", "are you a chatbot"
      ];
      if (selfSellTriggers.some(trigger => text.toLowerCase().includes(trigger))) {
        addMessage("I’m a custom AI assistant built by Serve AI to help businesses like this grow. Want one for your business? 👉 https://calendly.com/stephen4934", "bot");
        inputField.value = "";
        return;
      }

      sendMessage(text);
    });

    // Quick replies
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
