import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#f6f6f4",
          surface: "#ffffff",
          primary: "#111111",
          secondary: "#3f3f3f",
          accent: "#ff6b4a"
        }
      }
    }
  }
});
