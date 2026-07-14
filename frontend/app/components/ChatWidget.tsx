// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import OnboardingForm from "./OnboardingForm";
import { createSession } from "../api";

interface Session {
  sessionId: string;
  name: string;
  phone: string;
  location: string;
}

export default function ChatWidget() {
  const deploymentName = process.env.NEXT_PUBLIC_CHAT_DEPLOYMENT;
  const chatTitle = process.env.NEXT_PUBLIC_CHAT_TITLE || "Support Agent";
  const messengerRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [chatReady, setChatReady] = useState(false);
  const [isFolded, setIsFolded] = useState(false);

  // Restore session from sessionStorage on page load
  useEffect(() => {
    const stored = sessionStorage.getItem("hazel-session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
        setChatReady(true);
      } catch {
        sessionStorage.removeItem("hazel-session");
      }
    }
  }, []);

  // ── Intercept window.fetch to capture the true session ID ─────────────
  // We extract the session ID from the request URL, because that is the exact
  // ID that Dialogflow CX assigns to $context.session_id internally and uses
  // for all OpenAPI tool calls.
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [resource, options] = args;
      const url = typeof resource === "string" ? resource : (resource as any)?.url;

      if (url && (url.includes(":runSession") || url.includes(":converseConversation") || url.includes(":detectIntent"))) {
        try {
          // Extract "dfMessenger-..." from ".../sessions/dfMessenger-...:runSession" or "...:converseConversation"
          const match = url.match(/\/sessions\/([^:]+):/);
          if (match && match[1]) {
            const agentSessionId = match[1];

            if (sessionStorage.getItem("agent-session-id") !== agentSessionId) {
              sessionStorage.setItem("agent-session-id", agentSessionId);
              console.debug("[ChatWidget] Intercepted agent session ID from URL:", agentSessionId);

              window.dispatchEvent(new Event("hazel-session-changed"));

              const storedStr = sessionStorage.getItem("hazel-session");
              if (storedStr) {
                const stored = JSON.parse(storedStr);
                if (stored.name) {

                  await createSession({
                    sessionId: agentSessionId,
                    name: stored.name,
                    phone: stored.phone,
                    location: stored.location,
                  }).catch(e => console.warn("[ChatWidget] Failed to sync session to Python backend", e));
                }
              }
            }
          }
        } catch {
          // Ignore errors
        }
      }

      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);


  // Boot the chat messenger SDK once we have a session
  useEffect(() => {
    if (!deploymentName || !chatReady || !session) return;

    // Set attributes imperatively so TSX never silently drops them
    if (messengerRef.current) {
      messengerRef.current.setAttribute("url-allowlist", "*");
    }
    if (containerRef.current) {
      containerRef.current.setAttribute("chat-title", chatTitle);
      containerRef.current.setAttribute(
        "chat-title-icon",
        "https://gstatic.com/dialogflow-console/common/assets/ccai-favicons/conversational_agents.png"
      );
      containerRef.current.setAttribute("enable-file-upload", "true");
    }

    // Set session parameters as a JSON attribute directly on the element.
    // This is an alternative path the SDK reads BEFORE the JS API parameters key.
    if (messengerRef.current && session) {
      messengerRef.current.setAttribute(
        "parameters",
        JSON.stringify({
          sessionId: session.sessionId,
          customerName: session.name,
          customerPhone: session.phone,
          customerLocation: session.location,
        })
      );
    }

    // Register SDK context with session parameters so the agent knows who the user is
    const handleLoaded = () => {
      const chatSdk = (window as any).chatSdk;
      if (chatSdk) {
        chatSdk.registerContext(
          chatSdk.prebuilts.ces.createContext({
            deploymentName,
            tokenBroker: {
              enableTokenBroker: true,
              enableRecaptcha: false,
            },
            enableWelcomeEvent: true,
          })
        );
      }

      injectShadowStyles();
    };

    const injectShadowStyles = () => {
      const el = messengerRef.current;
      if (!el) return;

      const tryInject = () => {
        const shadow = el.shadowRoot;
        if (!shadow) return false;

        // Avoid double-injecting
        if (shadow.querySelector("#hazel-market-styles")) return true;

        const style = document.createElement("style");
        style.id = "hazel-market-styles";
        style.textContent = `
          /* ── Hazel Market brand overrides injected into shadow root ── */

          /* Titlebar */
          .titlebar, [class*="titlebar"], chat-messenger-titlebar,
          .chat-header, [class*="header"] {
            background-color: #9a7a66ff !important;
            color: #ffffff !important;
            padding-left: 48px !important;
          }

          /* Primary button / send button */
          button[class*="send"], button[class*="submit"],
          [class*="send-button"], [class*="primary-button"] {
            background-color: #4a3b32 !important;
            color: #ffffff !important;
            border-color: #a67455ff !important;
          }

          /* User message bubbles */
          [class*="user-message"], [class*="human-message"],
          [class*="outgoing"] {
            background-color: #5a7054 !important;
            color: #ffffff !important;
          }

          /* Bot message bubbles */
          [class*="bot-message"], [class*="agent-message"],
          [class*="incoming"], [class*="model-message"] {
            background-color: #f5f1ee !important;
            color: #38414cff !important;
          }

          /* Input area */
          [class*="input-area"], [class*="input-container"],
          [class*="composer"] {
            border-top-color: #d6cfc9 !important;
          }

          input, textarea {
            color: #1f2937 !important;
          }

          /* Active/focus accents */
          [class*="active"], *:focus {
            outline-color: #4a3b32 !important;
          }
        `;
        shadow.appendChild(style);
        return true;
      };

      // Try immediately, then watch for shadow root population via MutationObserver
      if (!tryInject()) {
        const observer = new MutationObserver(() => {
          if (tryInject()) observer.disconnect();
        });
        observer.observe(el, { childList: true, subtree: true });
        // Clean up after 10 s to avoid leaks if shadow never populates
        setTimeout(() => observer.disconnect(), 10000);
      }
    };

    // Race-condition guard: if script already loaded before this effect ran
    if ((window as any).chatSdk) {
      handleLoaded();
    } else {
      window.addEventListener("chat-messenger-loaded", handleLoaded);
    }

    return () => {
      window.removeEventListener("chat-messenger-loaded", handleLoaded);
    };
  }, [deploymentName, chatReady, session, chatTitle]);

  // Handler called by OnboardingForm on successful submit
  const handleFormComplete = (newSession: Session) => {
    setSession(newSession);
    setChatReady(true);
  };

  const clearSessionAndFold = () => {
    sessionStorage.removeItem("hazel-session");
    sessionStorage.removeItem("agent-session-id");
    sessionStorage.removeItem("shop-cart-items");
    setSession(null);
    setChatReady(false);
    setIsFolded(true);
  };

  const isContentVisible = !isFolded;

  // Sync CES titlebar close action with local fold state.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerClick = (event: Event) => {
      const path =
        typeof event.composedPath === "function" ? event.composedPath() : [];
      const clickedCloseButton = path.some((node) => {
        return (
          node instanceof HTMLElement &&
          node.tagName.toLowerCase() === "chat-messenger-close-button"
        );
      });

      if (clickedCloseButton) {
        clearSessionAndFold();
      }
    };

    container.addEventListener("click", handleContainerClick, true);
    return () => {
      container.removeEventListener("click", handleContainerClick, true);
    };
  }, [chatReady]);

  if (!deploymentName) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 99999,
        width: "400px",
        height: isFolded ? "50px" : "560px",
        maxHeight: isFolded ? "50px" : "560px",
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow: isFolded ? "0 4px 12px rgba(74,59,50,0.15)" : "0 8px 32px rgba(74,59,50,0.18)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="relative">
        <button
          onClick={() => setIsFolded(!isFolded)}
          style={{
            position: "absolute",
            left: isFolded ? "14px" : "360px",
            top: isFolded ? "16px" : "18px",
            zIndex: 100,
            background: isFolded
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(255, 255, 255, 0.15)",
            border: "none",
            borderRadius: "6px",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isFolded ? "#4a3b32" : "#898989",
            transition: "background 0.2s, transform 0.9s",
          }}
          title={isFolded ? "Expand Agent" : "Collapse Agent"}
          aria-label={isFolded ? "Expand Agent" : "Collapse Agent"}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isFolded ? "none" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          >
            {isFolded ? (
              <>
                <path d="M21 11.5C21 16.19 16.97 20 12 20C10.61 20 9.28 19.7 8.1 19.15L4 20L4.9 16.49C3.72 15.09 3 13.36 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z" />
                <circle
                  cx="9"
                  cy="11.5"
                  r="0.7"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="12"
                  cy="11.5"
                  r="0.7"
                  fill="currentColor"
                  stroke="none"
                />
                <circle
                  cx="15"
                  cy="11.5"
                  r="0.7"
                  fill="currentColor"
                  stroke="none"
                />
              </>
            ) : (
              <polyline className="" points="8,11 12,15 16,11"></polyline>
            )}
          </svg>
        </button>

        {chatReady && !isFolded && (
          <button
            onClick={() => setIsFolded(!isFolded)}
            style={{
              position: "absolute",
              left: isFolded ? "14px" : "270px",
              top: isFolded ? "16px" : "18px",
              zIndex: 100000,
             
              border: "none",
              borderRadius: "6px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isFolded ? "#4a3b32" : "#898989",
              transition: "background 0.2s, transform 0.9s",
            }}
            title="Close and clear session"
            aria-label="Close and clear session"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isFolded ? "none" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            >
              <polyline className="" points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        )}
      </div>

      <div
        style={{
          width: "100%",
          height: "100%",
          opacity: isContentVisible ? 1 : 0,
          visibility: isContentVisible ? "visible" : "hidden",
          pointerEvents: isContentVisible ? "auto" : "none",
          transition: "opacity 0.18s ease",
        }}
      >
        {!chatReady ? (
          <OnboardingForm onComplete={handleFormComplete} />
        ) : (
          <chat-messenger
            ref={messengerRef}
            style={{
              width: "100%",
              height: "100%",
              transform: "none",
              display: "block",
              position: "relative",
              inset: "auto",
              clipPath: "none",
            }}
          >
            <div></div>
            <chat-messenger-container ref={containerRef}>
              <chat-reset-session-button
                slot="titlebar-actions"
                title-text="Start new chat"
              ></chat-reset-session-button>
              <chat-messenger-close-button
                slot="titlebar-actions"
                title-text="Close"
              ></chat-messenger-close-button>
              <div></div>
            </chat-messenger-container>
          </chat-messenger>
        )}
      </div>
    </div>
  );
}
