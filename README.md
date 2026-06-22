# Reality Check

**Pause, investigate, and think before you share.**

Reality Check is a free, open-source tool that helps you evaluate the credibility of headlines and claims using a structured critical-thinking framework — combined with live web research powered by Claude.

🔗 **Live app:** https://realitycheck-project.vercel.app

---

## What it does

Paste in a headline or claim, and Reality Check researches it live on the web, then breaks down its credibility across four categories:

- **Source Check** — Who created this content, and is the source credible?
- **Evidence Check** — What evidence supports the claim, and can it be verified?
- **Context Check** — Is the content recent and presented in its original context?
- **Emotional Check** — Is the framing designed to provoke anger, fear, or excitement rather than rational thought?

Each check gets a verdict, supporting sources where available, and an overall credibility score out of 100.

A built-in **glossary** also covers key media literacy concepts: misinformation, disinformation, deepfakes, fabricated articles, bot amplification, clickbait, reverse image search, multi-source fact-checking, metadata analysis, and emotional manipulation.

---

## Privacy & Security

Reality Check is **fully client-side** — there is no backend server, and the developer of this app never sees your data or your API key.

- Your Anthropic API key is entered directly in the app and used only to communicate with Anthropic's API from your own browser.
- Your key is never transmitted to, or stored on, any server operated by this project or any third party.
- Nothing is logged, tracked, or saved outside your own browser session.

This is sometimes called a "bring your own key" (BYOK) app — you use your own Anthropic account, so you're always in control of your own usage and costs.

---

## Getting Started (for users)

1. Open the [live app](#) *(link coming soon)*
2. Click **Settings**
3. Paste in your Anthropic API key — get one for free at [console.anthropic.com](https://console.anthropic.com/settings/keys)
4. Start fact-checking

That's it — no installs, no accounts with us, no cost beyond your own Anthropic API usage.

---

## Running Locally (for developers)

This project is built with **React + Vite** and styled with **Tailwind CSS**.

```bash
git clone https://github.com/Virerra/reality-check.git
cd reality-check
npm install
npm run dev
```

Then open the local URL shown in your terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
```

This outputs static files to the `dist/` folder, which can be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

---

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Anthropic API](https://docs.anthropic.com/) (Claude, with web search)

---

## License

This project is open source under the [MIT License](LICENSE) — free to use, modify, and share.

---

## Disclaimer

Reality Check provides AI-assisted analysis based on live web search results. It is a tool to support critical thinking, not a replacement for it. Always verify important claims using primary sources.
