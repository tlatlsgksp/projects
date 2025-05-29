import { useEffect } from "react";

const CursorTrail = () => {
  useEffect(() => {
    const trailContainer = document.createElement("div");
    document.body.appendChild(trailContainer);

    const handleClick = (e) => {
      const trail = document.createElement("div");
      trail.textContent = "🐾";
      trail.style.position = "fixed";
      trail.style.left = `${e.clientX - 20}px`;
      trail.style.top = `${e.clientY - 20}px`;
      trail.style.zIndex = "9999";
      trail.style.fontSize = "30px";
      trail.style.opacity = "1";
      trail.style.pointerEvents = "none";
      trail.style.transition = "opacity 0.3s, transform 0.3s";
      trailContainer.appendChild(trail);

      setTimeout(() => {
        trail.style.opacity = "0";
        trail.style.transform = "translateY(-5px) scale(0.8)";
      }, 10);

      setTimeout(() => {
        trail.remove();
      }, 500);
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
      trailContainer.remove();
    };
  }, []);

  return null;
};

export default CursorTrail;