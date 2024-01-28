(function() {
  "use strict";
  document.documentElement.style.setProperty("--h", innerHeight + "px");
  document.documentElement.style.setProperty("--w", innerWidth + "px");
  addEventListener("load", async () => {
    try {
      await import("./main.ts");
    } catch(err) {
      console.log(err);
    }
  });
})();