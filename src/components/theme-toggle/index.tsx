import { useTheme } from "musae";
import { IconButton } from "musae";
import { DarkMode, LightMode } from "musae/icons";
import { useThemeStore } from "../../stores/theme.store";

function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const { persist } = useThemeStore();

  const handleToggle = () => {
    persist(toggle());
  };

  return (
    <div className="fixed right-4 bottom-24 z-50">
      <IconButton size="small" onClick={handleToggle} className="shadow-lg">
        {mode === "light" ? <DarkMode /> : <LightMode />}
      </IconButton>
    </div>
  );
}

export default ThemeToggle;
