# AI Agent Coding Conventions and UI Patterns

## UI Banner Animation Pattern (Recommended Session Banner)

- **Component:** `Arena.jsx`
- **Purpose:** Display a temporary, animated banner for recommended sessions, with a smooth hide animation.
- **Pattern:**
  - Banner is shown when a recommended session is present and not yet handled.
  - Banner auto-hides after 3.5 seconds, animates out (opacity/translate) for 0.5s, then is removed from the DOM.
  - Animation state is managed with two state variables: `showRecommendedBanner` (controls render) and `isBannerHiding` (controls animation class).
  - A `hasHandledRecommendedSessionRef` ref ensures the effect only runs once per session.
  - Example effect:
    ```js
    useEffect(() => {
      if (!recommendedSession || hasHandledRecommendedSessionRef.current) return;
      hasHandledRecommendedSessionRef.current = true;
      setShowRecommendedBanner(true);
      setIsBannerHiding(false);
      const hideTimer = setTimeout(() => {
        setIsBannerHiding(true);
        setTimeout(() => setShowRecommendedBanner(false), 500);
      }, 3500);
      return () => clearTimeout(hideTimer);
    }, [recommendedSession]);
    ```
  - Example render:
    ```jsx
    {recommendedSession && showRecommendedBanner && (
      <div className={`... transition-all duration-500 ${isBannerHiding ? 'translate-y-[-10px] opacity-0' : 'translate-y-0 opacity-100'}`}>
        ...
      </div>
    )}
    ```
- **Why:**
  - Ensures a smooth, non-jarring user experience for temporary banners.
  - Avoids repeated triggers and race conditions with a ref guard.
  - Animation classes are Tailwind-based but can be adapted.

## General Agent Guidance
- Prefer using refs to guard one-time effects for UI banners or onboarding flows.
- Use paired state for animation and visibility when animating out before unmounting.
- Place UI pattern documentation here for future AI agents to follow established conventions.

---

Add new patterns and conventions as they emerge in the codebase.

