// Sun City Chatbot Widget — Final Demo-Ready Layout (with hours/address fix)
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
    address: ""
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
      config.hours = conf.hours;
      config.address = conf.address;
      config.contact = { phone: conf.phone, email: conf.email };
    } catch (err) {
      console.warn("Failed to load Google Sheet config:", err);
    }

    // [The rest of your existing widget code is unchanged]
    // Style + HTML + input + messages + toggle logic
    // Only the sendMessage() below is modified to include hours + address

    const sendMessage = async (text) => {
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
            address: config.address
          }),
        });
        const data = await res.json();
        removeTypingDots();
        addMessage(data.reply, "bot");
      } catch (err) {
        removeTypingDots();
        addMessage("Sorry, something went wrong.", "bot");
      }
    };

    // [rest of code unchanged — event listener, quick replies, etc.]

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

    const addMessage = (text, sender) => {
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
    };

    const addTypingDots = () => {
      const typing = document.createElement("div");
      typing.className = "message bot";
      typing.id = "typing-indicator";
      typing.innerHTML = `
        <img src="${config.avatar}" class="bot-avatar" />
        <div class="bot-bubble typing-dots">...</div>
      `;
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;
    };

    const removeTypingDots = () => {
      const el = document.getElementById("typing-indicator");
      if (el) el.remove();
    };

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
