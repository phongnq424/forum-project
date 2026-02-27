<script>
    let currentYear = new Date().getFullYear();
</script>

<footer>
    <div class="container grid">
        <div class="brand">
            <div class="logo-row">
                <span>WINDFLOW</span>
            </div>
            <p>
                Programming Forum – A place to share knowledge, connect the
                developer community, and grow together.
            </p>
        </div>

        <div>
            <h3>Our Services</h3>
            <a href="/challenges">Coding challenges</a>
            <a href="/ai">Ask AI, Get Answers</a>
            <a href="/knowledge">Share & Learn Knowledge</a>
            <a href="/connect">Connect With Developers</a>
        </div>

        <div>
            <h3>Our Resources</h3>
            <a href="/docs">Documentation & Guides</a>
            <a href="/guidelines">Community Guidelines</a>
            <a href="/faq">FAQ & Support</a>
        </div>

        <div>
            <h3>About Us</h3>
            <div class="social">
                <a href="#" aria-label="Facebook" class="social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.06 5.66 21.18 10.44 22v-7h-3V12h3V9.8c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v3h-1.51c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3h-2.8v7C18.34 21.18 22 17.06 22 12.07z"
                        />
                    </svg>
                </a>

                <a href="#" aria-label="LinkedIn" class="social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7 0h4.8v2.3h.07c.67-1.27 2.3-2.6 4.73-2.6C21.42 7.7 24 10.1 24 15.3V24h-5v-7.6c0-1.8-.03-4.1-2.5-4.1-2.5 0-2.88 1.95-2.88 3.97V24H7V8z"
                        />
                    </svg>
                </a>

                <a href="#" aria-label="GitHub" class="social-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 008 10.94c.58.1.79-.25.79-.55v-2.1c-3.25.7-3.94-1.56-3.94-1.56-.53-1.35-1.3-1.7-1.3-1.7-1.07-.74.08-.73.08-.73 1.18.08 1.8 1.2 1.8 1.2 1.05 1.8 2.76 1.28 3.43.98.1-.77.41-1.28.75-1.58-2.6-.3-5.34-1.3-5.34-5.78 0-1.28.46-2.33 1.2-3.15-.12-.3-.52-1.5.12-3.13 0 0 .98-.32 3.2 1.2a11.1 11.1 0 015.82 0c2.2-1.52 3.18-1.2 3.18-1.2.65 1.63.25 2.83.13 3.13.75.82 1.2 1.87 1.2 3.15 0 4.5-2.75 5.47-5.37 5.77.42.37.8 1.1.8 2.22v3.3c0 .3.2.66.8.55A11.5 11.5 0 0023.5 12C23.5 5.73 18.27.5 12 .5z"
                        />
                    </svg>
                </a>

                <a
                    href="mailto:hello@windflow.com"
                    aria-label="Email"
                    class="social-btn"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12 13.5L0 6.75V18h24V6.75L12 13.5zm12-9H0l12 7.5L24 4.5z"
                        />
                    </svg>
                </a>
            </div>
        </div>
    </div>

    <div class="bottom">
        © {currentYear} Windflow Community. All rights reserved.
    </div>
</footer>

<style>
    footer {
        background: #1f1f1f;
        padding: 20px 0 10px;
        border-top: 1px solid rgba(139, 92, 246, 0.15);
    }

    .grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 60px;
    }

    h3 {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #d4d4d8;
        margin-bottom: 18px;
    }

    footer a {
        display: block;
        margin-bottom: 14px;
        color: #a1a1aa;
        font-size: 14px;
    }

    footer a:hover {
        color: white;
    }

    .brand span {
        font-weight: 600;
        font-size: 21px;
        letter-spacing: 0.04em;
        text-transform: none;
        color: #ffffff;
    }

    .logo-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }

    .brand p {
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.6;
        max-width: 260px;
    }

    .social {
        display: flex;
        gap: 14px;
        margin-top: 10px;
    }

    .social-btn {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a1a1aa;
        transition: all 0.2s ease;
    }

    .social-btn svg {
        width: 18px;
        height: 18px;
    }

    .social-btn:hover {
        background: linear-gradient(135deg, #6366f1, #9333ea);
        color: white;
        transform: translateY(-2px);
    }
    .bottom {
        text-align: center;
        margin-top: 30px;
        font-size: 12px;
        color: #71717a;
    }

    @media (max-width: 1024px) {
        .grid {
            grid-template-columns: 1.5fr 1fr; /* Brand rộng hơn một chút */
            gap: 40px;
        }
    }

    /* Mobile: Xếp chồng tất cả lên nhau và căn giữa */
    @media (max-width: 640px) {
        footer {
            padding: 40px 0 20px;
        }

        .grid {
            grid-template-columns: 1fr;
            gap: 32px;
            text-align: center; /* Căn giữa nội dung cho đẹp trên mobile */
        }

        .brand p {
            max-width: 100%; /* Cho phép text tràn hết chiều ngang */
            margin: 0 auto 20px;
        }

        .logo-row {
            justify-content: center; /* Căn giữa logo */
        }

        .social {
            justify-content: center; /* Căn giữa icon mạng xã hội */
        }

        h3 {
            margin-bottom: 12px;
        }

        footer a {
            margin-bottom: 10px;
        }
    }
</style>
