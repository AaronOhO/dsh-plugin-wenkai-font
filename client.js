window.__ModuleLoader__.load({
  id: 'dsh-plugin-wenkai-font',
  factory() {
    /** URL owned by the Host half of this package (see index.js). */
    const STYLESHEET_URL = '/dsh-wenkai/font.css';
    return {
      apply(ctx) {
        // The Host half already contributes the stylesheet to the index
        // document; that link is preserved across reloads and wins first paint.
        // This effect covers a page that was already open when the bundle
        // activated, and is removed again when the plugin unloads.
        ctx.effect(() => {
          if (document.querySelector('link[data-wenkai-font]') !== null) return () => {};
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = STYLESHEET_URL;
          link.setAttribute('data-wenkai-font', '');
          document.head.appendChild(link);
          return () => {
            link.remove();
          };
        });
      },
    };
  },
});
