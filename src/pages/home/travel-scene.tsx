import { useEffect, useState } from "react";
import { useTheme } from "musae";
import { useReducedMotion } from "../../utils/reduced-motion.util";
import landscape from "./assets/travel-landscape.jpg";
import car from "./assets/travel-car.png";
import styles from "./index.module.css";

// Keep return visits quiet; a fresh app runtime gets a new welcome.
let hasWelcomed = false;

const TravelScene = () => {
  const { mode } = useTheme();
  const reducedMotion = useReducedMotion();
  const [landscapeLoaded, setLandscapeLoaded] = useState(false);
  const [carLoaded, setCarLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ready = landscapeLoaded && carLoaded && !failed;

  useEffect(() => {
    if (!ready) return;
    if (!hasWelcomed && !reducedMotion) setPlaying(true);
    hasWelcomed = true;
  }, [ready, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  return (
    <div
      className={styles.travelScene}
      data-theme={mode}
      data-ready={ready}
      data-failed={failed}
      aria-hidden="true"
    >
      <div className={styles.sceneLayers}>
        <img
          className={styles.landscape}
          src={landscape}
          width={1200}
          height={800}
          alt=""
          draggable={false}
          fetchPriority="high"
          onLoad={() => setLandscapeLoaded(true)}
          onError={() => setFailed(true)}
        />
        <div
          className={styles.vehicle}
          data-playing={playing && !reducedMotion}
          onAnimationEnd={() => setPlaying(false)}
        >
          <img
            className={styles.car}
            src={car}
            width={1024}
            height={682}
            alt=""
            draggable={false}
            onLoad={() => setCarLoaded(true)}
            onError={() => setFailed(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default TravelScene;
