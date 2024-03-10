// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig

// /** @type {import('next').NextConfig} */
// const withTM = require("next-transpile-modules")(["@mui/material", "@mui/system", "@mui/icons-material"]);

// module.exports = withTM({
//   reactStrictMode: false,
// });

/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")([]);

module.exports = withTM({
  reactStrictMode: false,
});
