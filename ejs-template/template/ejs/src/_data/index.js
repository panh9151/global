import about from "./about";
import linklists from "./linklists";

export default (pagePath, config) => ({
  base: config.base,
  linklists: linklists(pagePath, config),
  about,
});
