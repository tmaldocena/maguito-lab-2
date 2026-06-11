import { useEffect, useMemo, useRef, useState } from 'react';
import wand from '/wand.svg';
import star from '/star.svg';
import './App.css'

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function Cross({ x, y, mouse }) {
  const dx = mouse.x - x;
  const dy = mouse.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = 120;
  const near = dist < maxDist;
  const amount = near ? (1 - dist / maxDist) : 0;
  const lift = amount * 14;
  const scale = 1 + amount * 0.3;

  return (
    <div
      className="cross"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${-lift}px) scale(${scale})`,
        opacity: 0.25 + amount * 0.35,
      }}
    />
  );
}

function App() {

  const wandRef = useRef(null);
  const textRef = useRef(null);
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  const crossSize = 60;
  const crosses = useMemo(() => {
    const cols = Math.ceil(windowSize.w / crossSize) + 1;
    const rows = Math.ceil(windowSize.h / crossSize) + 1;
    const result = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          id: `${r}-${c}`,
          x: c * crossSize + crossSize / 2,
          y: r * crossSize + crossSize / 2,
        });
      }
    }
    return result;
  }, [windowSize]);

  const stars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = randomBetween(0, 360);
      const radius = randomBetween(22, 42);
      const cx = 50, cy = 35;
      const rad = angle * Math.PI / 180;
      const left = Math.max(2, Math.min(98, cx + radius * Math.cos(rad)));
      const bottom = Math.max(2, Math.min(92, cy + radius * Math.sin(rad)));
      return { id: i, left, bottom, size: randomBetween(4, 8), delay: randomBetween(0, 3), factor: randomBetween(0.5, 1) };
    });
  }, []);

  useEffect(() => {
    let rafId;
    const wand = wandRef.current;
    const text = textRef.current;
    if (!wand || !text) return;

    const handleMouseMove = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMouse({ x: e.clientX, y: e.clientY });

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        wand.style.transform = `translate(${offsetX / 20}px, ${offsetY / 20}px)`;
        text.style.transform = `translate(${offsetX / 70}px, ${offsetY / 70}px)`;
      });
    };

    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section id='main'>
      <div id="background"></div>
      <div id="cross-container">
        {crosses.map(c => (
          <Cross key={c.id} x={c.x} y={c.y} mouse={mouse} />
        ))}
      </div>
      <img id="title" ref={textRef} src="/title.svg" alt="Maguito Labs" />

      <img ref={wandRef} id="wand" src={wand} alt="" />
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            bottom: `${s.bottom}%`,
            width: `${s.size}%`,
            height: `${s.size}%`,
            transform: `translate(
              ${mouse.x * s.factor * 0.05}px,
              ${mouse.y * s.factor * 0.05}px
            )`
          }}
        >
          <img
            className="star-inner"
            src={star}
            alt=""
            style={{ animationDelay: `${s.delay}s` }}
          />
        </div>
      ))}
    </section>
  )
}

export default App
