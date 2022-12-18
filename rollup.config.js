import postcss from "rollup-plugin-postcss";

export default {
  external: ["three", "orbitControls", "fontLoader", "textGeometry"],
  input: ["src/script.js"],
  output: [
    {
      dir: "public",
      format: "system",
      sourcemap: true,
    },
  ],
  plugins: [
    postcss({
      extensions: [".css"],
    }),
  ],
};
