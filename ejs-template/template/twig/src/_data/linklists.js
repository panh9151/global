import resolveLinks from "../../plugins/utils/resolveLinks";

export default (pagePath, config) => {
  const linklists = {
    main: [
      {
        title: "Home",
        url: "/index.html",
      },
      {
        title: "About",
        url: "/about.html",
      },
      {
        title: "Read more",
        url: "#",
      },
    ],
  };

  return resolveLinks(linklists, pagePath, config);
};
